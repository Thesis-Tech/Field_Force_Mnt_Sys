const prisma = require('../config/prisma');
const { emitToOrgAdmins } = require('../config/socket');
const { NotFoundError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Calculate distance between two coordinates using the Haversine formula
 */
const calculateHaversine = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Bulk insert locations and notify admin room via Socket
 */
const batchInsertLocation = async (userId, locations, organizationId) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, organizationId }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Bulk insert location logs
  const dataToInsert = locations.map(loc => ({
    userId,
    latitude: loc.latitude,
    longitude: loc.longitude,
    accuracy: loc.accuracy,
    speed: loc.speed || null,
    heading: loc.heading || null,
    altitude: loc.altitude || null,
    batteryLevel: loc.batteryLevel || null,
    isMoving: loc.isMoving,
    recordedAt: new Date(loc.recordedAt)
  }));

  const result = await prisma.locationLog.createMany({
    data: dataToInsert
  });

  // Emit last known location to admins room
  if (locations.length > 0) {
    const lastLoc = locations[locations.length - 1];
    
    emitToOrgAdmins(organizationId, 'location:update', {
      userId,
      userName: user.name,
      role: user.role,
      latitude: lastLoc.latitude,
      longitude: lastLoc.longitude,
      accuracy: lastLoc.accuracy,
      speed: lastLoc.speed,
      batteryLevel: lastLoc.batteryLevel,
      isMoving: lastLoc.isMoving,
      recordedAt: lastLoc.recordedAt
    });
  }

  return { inserted: result.count };
};

/**
 * Get live status of all field staff locations in last 2 hours
 */
const getLiveLocations = async (organizationId) => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // Fetch all users in organization with their last location log after twoHoursAgo
  const fieldStaff = await prisma.user.findMany({
    where: {
      organizationId,
      role: 'FIELD_STAFF',
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      role: true,
      status: true,
      territory: {
        select: {
          id: true,
          name: true,
          polygon: true
        }
      },
      locationLogs: {
        where: {
          recordedAt: { gte: twoHoursAgo }
        },
        orderBy: { recordedAt: 'desc' },
        take: 1
      }
    }
  });

  // Map to structure containing the last log
  const liveLocations = fieldStaff
    .map(staff => {
      const lastLog = staff.locationLogs[0] || null;
      if (!lastLog) return null;

      return {
        userId: staff.id,
        name: staff.name,
        role: staff.role,
        latitude: lastLog.latitude,
        longitude: lastLog.longitude,
        battery: lastLog.batteryLevel,
        isMoving: lastLog.isMoving,
        recordedAt: lastLog.recordedAt,
        territory: staff.territory
      };
    })
    .filter(Boolean); // Remove null logs

  return liveLocations;
};

/**
 * Get location log history for route playback and compute Haversine distance
 */
const getLocationHistory = async (userId, startDateStr, endDateStr, organizationId) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, organizationId }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Parse dates, default to today
  const startOfDay = startDateStr ? new Date(`${startDateStr}T00:00:00.000Z`) : new Date();
  if (!startDateStr) {
    startOfDay.setUTCHours(0, 0, 0, 0);
  }

  const endOfDay = endDateStr ? new Date(`${endDateStr}T23:59:59.999Z`) : new Date();
  if (!endDateStr) {
    endOfDay.setUTCHours(23, 59, 59, 999);
  }

  // Fetch ordered logs
  const logs = await prisma.locationLog.findMany({
    where: {
      userId,
      recordedAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: { recordedAt: 'asc' }
  });

  // Calculate cumulative distance using Haversine
  let totalDistance = 0; // in km
  for (let i = 1; i < logs.length; i++) {
    const prev = logs[i - 1];
    const curr = logs[i];
    const distance = calculateHaversine(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    
    // Ignore spikes/GPS errors (e.g. distance > 50km in 1 min is unlikely)
    if (distance < 50) {
      totalDistance += distance;
    }
  }

  // Calculate active time
  let timeActiveMinutes = 0;
  if (logs.length > 1) {
    const durationMs = logs[logs.length - 1].recordedAt - logs[0].recordedAt;
    timeActiveMinutes = Math.floor(durationMs / 60000);
  }

  // Count unique locations (using 4 decimal places of lat/lng for approx 11m grid resolution)
  const uniqueCoords = new Set();
  logs.forEach(log => {
    const latGrid = log.latitude.toFixed(4);
    const lngGrid = log.longitude.toFixed(4);
    uniqueCoords.add(`${latGrid},${lngGrid}`);
  });

  return {
    userId,
    userName: user.name,
    startDate: startOfDay,
    endDate: endOfDay,
    totalDistanceKm: parseFloat(totalDistance.toFixed(2)),
    timeActiveMinutes,
    totalUniqueLocations: uniqueCoords.size,
    logs
  };
};

module.exports = {
  batchInsertLocation,
  getLiveLocations,
  getLocationHistory
};
