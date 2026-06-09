const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const logger = require('../config/logger');
const { validateCoordinatePrecision } = require('../utils/validateCoordinatePrecision');

/**
 * Upload base64 signature to Cloudinary
 */
const uploadSignature = async (base64Str) => {
  try {
    const formattedStr = base64Str.startsWith('data:image') 
      ? base64Str 
      : `data:image/png;base64,${base64Str}`;

    const res = await cloudinary.uploader.upload(formattedStr, {
      folder: 'ffms/signatures',
      resource_type: 'image'
    });
    return res.secure_url;
  } catch (err) {
    logger.error('Failed to upload signature to Cloudinary:', err);
    throw new BadRequestError('Failed to upload signature image');
  }
};

/**
 * Upload multiple base64 images to Cloudinary
 */
const uploadVisitImages = async (imageBufferArray) => {
  const uploadedUrls = [];
  for (const imgBase64 of imageBufferArray) {
    try {
      const formattedStr = imgBase64.startsWith('data:image') 
        ? imgBase64 
        : `data:image/jpeg;base64,${imgBase64}`;

      const res = await cloudinary.uploader.upload(formattedStr, {
        folder: 'ffms/visits',
        resource_type: 'image'
      });
      uploadedUrls.push(res.secure_url);
    } catch (err) {
      logger.error('Failed to upload visit report image:', err);
    }
  }
  return uploadedUrls;
};

/**
 * Create Visit Report
 */
const createVisitReport = async (userId, visitData, organizationId) => {
  // Confirm user belongs to organization
  const user = await prisma.user.findFirst({
    where: { id: userId, organizationId }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { images, signatureBase64, taskAssignmentId, ...restVisitData } = visitData;

  if (restVisitData.latitude !== undefined && restVisitData.longitude !== undefined) {
    validateCoordinatePrecision(restVisitData.latitude, restVisitData.longitude);
  }

  // 1. Upload images
  let imageUrls = [];
  if (images && images.length > 0) {
    imageUrls = await uploadVisitImages(images);
  }

  // 2. Upload signature
  let signatureUrl = null;
  if (signatureBase64) {
    signatureUrl = await uploadSignature(signatureBase64);
  }

  // 3. Create VisitReport record
  const visitReport = await prisma.visitReport.create({
    data: {
      ...restVisitData,
      checkInTime: restVisitData.checkInTime ? new Date(restVisitData.checkInTime) : null,
      checkOutTime: restVisitData.checkOutTime ? new Date(restVisitData.checkOutTime) : null,
      nextFollowUpDate: restVisitData.nextFollowUpDate ? new Date(restVisitData.nextFollowUpDate) : null,
      userId,
      taskAssignmentId: taskAssignmentId || null,
      images: imageUrls,
      signatureUrl
    }
  });

  // 4. Update task assignment status if linked
  if (taskAssignmentId) {
    const assignment = await prisma.taskAssignment.findUnique({
      where: { id: taskAssignmentId }
    });

    if (assignment) {
      // If assignment is not yet marked in-progress or accepted, move it to IN_PROGRESS
      if (['ASSIGNED', 'ACCEPTED'].includes(assignment.status)) {
        await prisma.taskAssignment.update({
          where: { id: taskAssignmentId },
          data: { status: 'IN_PROGRESS', acceptedAt: new Date() }
        });
        
        // Also update parent task to IN_PROGRESS
        await prisma.task.update({
          where: { id: assignment.taskId },
          data: { status: 'IN_PROGRESS' }
        });
      }

      // If visit is marked COMPLETED, set assignment to COMPLETED and update timestamps
      if (restVisitData.visitStatus === 'COMPLETED') {
        await prisma.taskAssignment.update({
          where: { id: taskAssignmentId },
          data: { 
            status: 'COMPLETED', 
            completedAt: new Date(),
            completionNote: `Auto completed via Visit Report: ${restVisitData.notes || ''}`
          }
        });

        // Also check if all assignments on this task are complete to update parent task status
        const pendingAssignments = await prisma.taskAssignment.count({
          where: {
            taskId: assignment.taskId,
            status: { not: 'COMPLETED' }
          }
        });

        if (pendingAssignments === 0) {
          await prisma.task.update({
            where: { id: assignment.taskId },
            data: { status: 'COMPLETED' }
          });
        }
      }
    }
  }

  return visitReport;
};

/**
 * List Visit Reports
 */
const listVisitReports = async ({
  organizationId,
  role,
  requestingUserId,
  userId,
  visitType,
  visitStatus,
  startDate,
  endDate,
  search,
  page = 1,
  limit = 20,
  sortBy = 'createdAt',
  sortOrder = 'desc'
}) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  // Set up base query
  const where = {
    user: {
      organizationId
    },
    ...(visitType && { visitType }),
    ...(visitStatus && { visitStatus }),
    // Search query on customerName
    ...(search && {
      customerName: { contains: search, mode: 'insensitive' }
    }),
    // Date range filter
    ...((startDate || endDate) && {
      createdAt: {
        ...(startDate && { gte: new Date(`${startDate}T00:00:00.000Z`) }),
        ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) })
      }
    })
  };

  // Role restriction: FIELD_STAFF can only see their own visit reports
  let targetUserId = userId;
  if (role === 'FIELD_STAFF') {
    targetUserId = requestingUserId;
  }
  
  if (targetUserId) {
    where.userId = targetUserId;
  }

  const total = await prisma.visitReport.count({ where });

  const visits = await prisma.visitReport.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip: (parsedPage - 1) * parsedLimit,
    take: parsedLimit,
    include: {
      user: {
        select: { id: true, name: true, employeeId: true }
      },
      taskAssignment: {
        include: {
          task: {
            select: { id: true, title: true }
          }
        }
      }
    }
  });

  return {
    visits,
    meta: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      hasMore: parsedPage * parsedLimit < total
    }
  };
};

/**
 * Get Visit Report by ID
 */
const getVisitReportById = async (id, organizationId) => {
  const visit = await prisma.visitReport.findFirst({
    where: {
      id,
      user: { organizationId }
    },
    include: {
      user: {
        select: { id: true, name: true, employeeId: true, phone: true }
      },
      taskAssignment: {
        include: {
          task: true
        }
      }
    }
  });

  if (!visit) {
    throw new NotFoundError('Visit report not found');
  }

  return visit;
};

const getMyVisits = async (userId, { page = 1, limit = 10 } = {}) => {
  const [visits, total] = await Promise.all([
    prisma.visitReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        taskAssignment: { include: { task: { select: { title: true } } } },
      },
    }),
    prisma.visitReport.count({ where: { userId } }),
  ])
  return { visits, total, page, limit }
};

const updateVisitReport = async (visitId, userId, data) => {
  const visit = await prisma.visitReport.findUnique({ where: { id: visitId } })
  if (!visit) {
    const err = new Error('Visit report not found'); err.statusCode = 404; throw err
  }
  if (visit.userId !== userId) {
    const err = new Error('Not authorised'); err.statusCode = 403; throw err
  }
  if (data.latitude !== undefined && data.longitude !== undefined) {
    validateCoordinatePrecision(data.latitude, data.longitude);
  }
  return prisma.visitReport.update({ where: { id: visitId }, data })
}

module.exports = {
  createVisitReport,
  listVisitReports,
  getVisitReportById,
  getMyVisits,
  updateVisitReport
}

