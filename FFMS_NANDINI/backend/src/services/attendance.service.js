const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const { emitToOrgAdmins } = require('../config/socket');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Point-in-polygon (Ray casting algorithm)
 * Validates whether a given lat/long falls within a GeoJSON Polygon.
 * Crucial for Geofence/Territory validation during Check-in.
 * Time Complexity: O(n) where n is the number of vertices in the polygon.
 */
const isPointInPolygon = (lat, lng, polygon) => {
  const coords = polygon.coordinates[0];
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [xi, yi] = coords[i]; // [lng, lat]
    const [xj, yj] = coords[j];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Retrieve shift configuration from env
const getShiftConfig = () => {
  const shiftStart = process.env.DEFAULT_SHIFT_START || '09:00';
  const shiftEnd = process.env.DEFAULT_SHIFT_END || '18:00';
  const lateThreshold = parseInt(process.env.LATE_THRESHOLD_MINUTES || '15');
  
  const [startHours, startMinutes] = shiftStart.split(':').map(Number);
  const [endHours, endMinutes] = shiftEnd.split(':').map(Number);

  return {
    startMinutes: startHours * 60 + startMinutes,
    endMinutes: endHours * 60 + endMinutes,
    lateThreshold
  };
};

/**
 * Perform base64 upload to Cloudinary
 */
const uploadSelfie = async (base64Str) => {
  try {
    const formattedStr = base64Str.startsWith('data:image') 
      ? base64Str 
      : `data:image/jpeg;base64,${base64Str}`;

    const res = await cloudinary.uploader.upload(formattedStr, {
      folder: 'ffms/selfies',
      resource_type: 'image'
    });
    return res.secure_url;
  } catch (err) {
    logger.error('Failed to upload check-in selfie to Cloudinary:', err);
    throw new BadRequestError('Failed to process/upload selfie image');
  }
};

/**
 * Check In Service
 * Processes daily attendance for Field Staff.
 * 
 * Workflow:
 * 1. Validates that user hasn't already checked in today.
 * 2. Fetches user's assigned Territory (Geofence).
 * 3. Uses Ray-Casting (`isPointInPolygon`) to ensure the user is physically inside their territory.
 * 4. Compresses & Uploads the base64 Selfie to Cloudinary.
 * 5. Calculates "Late" status based on environment config.
 * 6. Commits record to Prisma DB and broadcasts a Socket.IO event to Admins.
 */
const checkIn = async (userId, { latitude, longitude, selfieBase64 }, organizationId) => {
  const now = new Date();
  
  // Date truncated to day
  const todayStr = now.toISOString().split('T')[0];
  const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

  // 1. Count today's sessions for the user and validate session state
  const todaySessions = await prisma.attendance.findMany({
    where: {
      userId,
      date: todayDate
    },
    orderBy: {
      sessionNumber: 'asc'
    }
  });

  if (todaySessions.length >= 10) {
    throw new BadRequestError('Maximum 10 check-in/check-out sessions reached for today.');
  }

  if (todaySessions.length > 0) {
    const lastSession = todaySessions[todaySessions.length - 1];
    if (!lastSession.checkOutTime) {
      throw new BadRequestError(`You must check out from Session ${todaySessions.length} before checking in for Session ${todaySessions.length + 1}.`);
    }
  }

  const sessionNumber = todaySessions.length + 1;

  // 1.5 Geofence check
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { territoryId: true }
  });

  if (userRecord && userRecord.territoryId) {
    const territory = await prisma.territory.findUnique({
      where: { id: userRecord.territoryId },
      select: { polygon: true }
    });

    if (territory && territory.polygon) {
      const inside = isPointInPolygon(latitude, longitude, territory.polygon);
      if (!inside) {
        throw new BadRequestError('You are outside your assigned work location. Please reach your territory to punch attendance.');
      }
    }
  }

  // 2. Upload selfie to Cloudinary if provided
  let selfieUrl = null;
  if (selfieBase64) {
    selfieUrl = await uploadSelfie(selfieBase64);
  }

  // 3. Determine if late
  const { startMinutes, lateThreshold } = getShiftConfig();
  
  // Get check-in time in minutes from midnight (local time)
  const localCheckInTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Standard GMT+5:30 offset adjustment for India or local time
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isLate = currentMinutes > (startMinutes + lateThreshold);

  // 4. Create Attendance record
  const attendance = await prisma.attendance.create({
    data: {
      userId,
      date: todayDate,
      sessionNumber,
      checkInTime: now,
      checkInLatitude: latitude,
      checkInLongitude: longitude,
      status: isLate ? 'LATE' : 'PRESENT',
      isLate,
      selfieUrl
    },
    include: {
      user: {
        select: { id: true, name: true, employeeId: true }
      }
    }
  });

  // 5. Emit Socket.IO event to managers
  emitToOrgAdmins(organizationId, 'attendance:checkin', {
    attendanceId: attendance.id,
    userId,
    userName: attendance.user.name,
    employeeId: attendance.user.employeeId,
    checkInTime: now,
    status: attendance.status,
    isLate,
    sessionNumber
  });

  if (isLate) {
    emitToOrgAdmins(organizationId, 'attendance:alert', {
      type: 'LATE_CHECKIN',
      userId,
      userName: attendance.user.name,
      checkInTime: now,
      message: `${attendance.user.name} checked in late at ${now.toLocaleTimeString()}`
    });
  }

  return attendance;
};

/**
 * Check Out Service
 */
const checkOut = async (userId, { latitude, longitude }, organizationId) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

  // 1. Find today's active/open session
  const openSession = await prisma.attendance.findFirst({
    where: {
      userId,
      date: todayDate,
      checkOutTime: null
    },
    include: {
      user: {
        select: { name: true }
      }
    }
  });

  if (!openSession) {
    throw new BadRequestError('You must check in first before checking out');
  }

  // 2. Compute working minutes for this session
  const checkInTime = new Date(openSession.checkInTime);
  const workingMinutes = Math.floor((now - checkInTime) / 60000);

  // 3. Determine if early logout
  const { endMinutes } = getShiftConfig();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isEarlyLogout = currentMinutes < endMinutes;

  // 4. Determine Status based on cumulative working hours business rules
  const pastSessions = await prisma.attendance.findMany({
    where: {
      userId,
      date: todayDate,
      id: { not: openSession.id }
    }
  });

  const pastWorkingMinutes = pastSessions.reduce((sum, s) => sum + (s.workingMinutes || 0), 0);
  const cumulativeWorkingMinutes = pastWorkingMinutes + workingMinutes;

  let calculatedStatus = openSession.status;
  if (cumulativeWorkingMinutes < 240) {
    calculatedStatus = 'ABSENT';
  } else if (cumulativeWorkingMinutes < 420) {
    calculatedStatus = 'HALF_DAY';
  } else {
    // If working > 7 hours, maintain 'LATE' if any session check-in was late
    const eitherLate = openSession.isLate || pastSessions.some(s => s.isLate);
    calculatedStatus = eitherLate ? 'LATE' : 'PRESENT';
  }

  // 5. Update record
  const updatedAttendance = await prisma.attendance.update({
    where: { id: openSession.id },
    data: {
      checkOutTime: now,
      checkOutLatitude: latitude,
      checkOutLongitude: longitude,
      workingMinutes,
      isEarlyLogout,
      status: calculatedStatus
    }
  });

  // Retroactively update all previous sessions' status as well
  if (pastSessions.length > 0) {
    await prisma.attendance.updateMany({
      where: {
        userId,
        date: todayDate,
        id: { not: openSession.id }
      },
      data: { status: calculatedStatus }
    });
  }

  // 6. Emit Socket event to managers
  emitToOrgAdmins(organizationId, 'attendance:checkout', {
    attendanceId: openSession.id,
    userId,
    userName: openSession.user.name,
    checkOutTime: now,
    workingMinutes,
    isEarlyLogout,
    sessionNumber: openSession.sessionNumber,
    calculatedStatus
  });

  if (isEarlyLogout) {
    emitToOrgAdmins(organizationId, 'attendance:alert', {
      type: 'EARLY_LOGOUT',
      userId,
      userName: openSession.user.name,
      checkOutTime: now,
      message: `${openSession.user.name} checked out early at ${now.toLocaleTimeString()}`
    });
  }

  return updatedAttendance;
};

/**
 * List attendance with filters and pagination
 */
const listAttendance = async ({
  organizationId,
  requestingUser,
  userId,
  startDate,
  endDate,
  status,
  month,
  year,
  page = 1,
  limit = 20
}) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  // Authorization check: Field staff can only see their own attendance logs
  let targetUserId = userId;
  if (requestingUser.role === 'FIELD_STAFF') {
    targetUserId = requestingUser.id;
  }

  const where = {
    user: {
      organizationId
    },
    ...(targetUserId && { userId: targetUserId }),
    ...(status && { status }),
    // Filter by date range
    ...((startDate || endDate) && {
      date: {
        ...(startDate && { gte: new Date(`${startDate}T00:00:00.000Z`) }),
        ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) })
      }
    }),
    // Filter by specific month and year
    ...((month || year) && {
      date: {
        gte: new Date(year || new Date().getFullYear(), (month ? parseInt(month) - 1 : 0), 1),
        lte: new Date(year || new Date().getFullYear(), (month ? parseInt(month) : 12), 0, 23, 59, 59, 999)
      }
    })
  };

  const total = await prisma.attendance.count({ where });

  const records = await prisma.attendance.findMany({
    where,
    orderBy: { date: 'desc' },
    skip: (parsedPage - 1) * parsedLimit,
    take: parsedLimit,
    include: {
      user: {
        select: { id: true, name: true, employeeId: true }
      }
    }
  });

  // Calculate stats for target user (if querying a single user)
  let statsSummary = null;
  if (targetUserId) {
    const summaryAggregates = await prisma.attendance.aggregate({
      where: { userId: targetUserId },
      _count: { id: true },
      _sum: { workingMinutes: true }
    });

    const totalDays = summaryAggregates._count.id;
    const totalMinutes = summaryAggregates._sum.workingMinutes || 0;

    const presentDays = await prisma.attendance.count({
      where: { userId: targetUserId, status: { in: ['PRESENT', 'LATE'] } }
    });

    const lateDays = await prisma.attendance.count({
      where: { userId: targetUserId, isLate: true }
    });

    const earlyLogouts = await prisma.attendance.count({
      where: { userId: targetUserId, isEarlyLogout: true }
    });

    statsSummary = {
      totalRecords: totalDays,
      presentDays,
      lateDays,
      earlyLogouts,
      avgWorkingHours: totalDays > 0 ? parseFloat(((totalMinutes / 60) / totalDays).toFixed(2)) : 0
    };
  }

  return {
    records,
    meta: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      hasMore: parsedPage * parsedLimit < total,
      summary: statsSummary
    }
  };
};

/**
 * Get attendance stats per date range
 */
const getAttendanceSummary = async (startDate, endDate, organizationId) => {
  const where = {
    user: {
      organizationId
    },
    date: {
      gte: new Date(`${startDate}T00:00:00.000Z`),
      lte: new Date(`${endDate}T23:59:59.999Z`)
    }
  };

  const totalRecords = await prisma.attendance.count({ where });
  const totalPresent = await prisma.attendance.count({
    where: { ...where, status: { in: ['PRESENT', 'LATE'] } }
  });
  const totalAbsent = await prisma.attendance.count({
    where: { ...where, status: 'ABSENT' }
  });
  const totalLate = await prisma.attendance.count({
    where: { ...where, isLate: true }
  });

  const workingMinutesAggregate = await prisma.attendance.aggregate({
    where,
    _sum: { workingMinutes: true },
    _count: { workingMinutes: true }
  });

  const sumMinutes = workingMinutesAggregate._sum.workingMinutes || 0;
  const countMinutes = workingMinutesAggregate._count.workingMinutes || 1;
  const avgWorkingHours = (sumMinutes / 60) / countMinutes;

  return {
    totalPresent,
    totalAbsent,
    totalLate,
    avgWorkingHours: parseFloat(avgWorkingHours.toFixed(2)),
    totalRecords
  };
};

/**
 * Live today's attendance status for all field staff
 */
const getTodayAttendance = async (organizationId) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

  // Fetch all active field staff users
  const staffUsers = await prisma.user.findMany({
    where: {
      organizationId,
      role: 'FIELD_STAFF',
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      employeeId: true,
      phone: true,
      profileImage: true,
      attendances: {
        where: { date: todayDate },
        orderBy: { sessionNumber: 'desc' },
        take: 1
      }
    }
  });

  // Format response indicating check-in status
  return staffUsers.map(staff => {
    const att = staff.attendances[0] || null;

    return {
      userId: staff.id,
      name: staff.name,
      employeeId: staff.employeeId,
      phone: staff.phone,
      profileImage: staff.profileImage,
      checkedIn: !!att,
      checkInTime: att ? att.checkInTime : null,
      checkOutTime: att ? att.checkOutTime : null,
      status: att ? att.status : 'ABSENT',
      isLate: att ? att.isLate : false,
      selfieUrl: att ? att.selfieUrl : null
    };
  });
};

/**
 * Manual correction of attendance record by admin
 */
const manualCorrection = async (id, updateData, organizationId) => {
  const record = await prisma.attendance.findFirst({
    where: {
      id,
      user: { organizationId }
    }
  });

  if (!record) {
    throw new NotFoundError('Attendance record not found');
  }

  // If checkInTime or checkOutTime are changed, recalculate working minutes
  let workingMinutes = record.workingMinutes;
  const checkIn = updateData.checkInTime ? new Date(updateData.checkInTime) : record.checkInTime;
  const checkOut = updateData.checkOutTime ? new Date(updateData.checkOutTime) : record.checkOutTime;

  if (checkIn && checkOut) {
    workingMinutes = Math.floor((new Date(checkOut) - new Date(checkIn)) / 60000);
  }

  const updatedRecord = await prisma.attendance.update({
    where: { id },
    data: {
      ...updateData,
      workingMinutes
    }
  });

  return updatedRecord;
};

/**
 * Upload periodic status photo
 */
const uploadStatusPhoto = async (userId, { selfieBase64, backCameraBase64, latitude, longitude }, organizationId) => {
  // Upload both to cloudinary
  const selfieUrl = await uploadSelfie(selfieBase64);
  const backUrl = await uploadSelfie(backCameraBase64); // reuse same function as it just uploads to ffms/selfies

  // Save as a VisitReport of type OTHER
  const report = await prisma.visitReport.create({
    data: {
      userId,
      customerName: 'Internal System',
      visitType: 'OTHER',
      notes: 'Periodic 15-Minute Status Photo',
      latitude,
      longitude,
      images: [selfieUrl, backUrl],
    }
  });

  return report;
};

module.exports = {
  checkIn,
  checkOut,
  listAttendance,
  getAttendanceSummary,
  getTodayAttendance,
  manualCorrection,
  uploadStatusPhoto
};
