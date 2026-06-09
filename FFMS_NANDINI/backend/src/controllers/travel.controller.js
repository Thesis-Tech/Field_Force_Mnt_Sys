const travelService = require('../services/travel.service');
const { successResponse } = require('../utils/response');
const logger = require('../config/logger');

/**
 * GET /travel/my/today
 * Returns today's travel log for the current user
 */
const getMyTodayTravel = async (req, res, next) => {
  try {
    const log = await travelService.getTodayTravelLog(req.user.id);
    return successResponse(res, { log });
  } catch (err) {
    logger.error('getMyTodayTravel error:', err);
    next(err);
  }
};

/**
 * PATCH /travel/my/today
 * Upsert today's travel log (meter start, meter end, proof image)
 */
const upsertMyTravelLog = async (req, res, next) => {
  try {
    const { meterStart, meterEnd, proofImageBase64, notes } = req.body;

    const log = await travelService.upsertTravelLog(req.user.id, {
      meterStart: meterStart != null ? parseFloat(meterStart) : undefined,
      meterEnd: meterEnd != null ? parseFloat(meterEnd) : undefined,
      proofImageBase64,
      notes,
    });

    return successResponse(res, { log });
  } catch (err) {
    logger.error('upsertMyTravelLog error:', err);
    next(err);
  }
};

/**
 * GET /travel/my
 * Returns travel log history (paginated, most recent first)
 */
const getMyTravelHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page ?? '1');
    const limit = parseInt(req.query.limit ?? '10');

    const result = await travelService.getTravelHistory(req.user.id, { page, limit });
    return successResponse(res, result);
  } catch (err) {
    logger.error('getMyTravelHistory error:', err);
    next(err);
  }
};

/**
 * GET /travel/attendance/monthly-summary
 * Returns present/absent/leave count for the current month
 */
const getMonthlyAttendanceSummary = async (req, res, next) => {
  try {
    const summary = await travelService.getMonthlySummary(req.user.id);
    return successResponse(res, { summary });
  } catch (err) {
    logger.error('getMonthlyAttendanceSummary error:', err);
    next(err);
  }
};

module.exports = {
  getMyTodayTravel,
  upsertMyTravelLog,
  getMyTravelHistory,
  getMonthlyAttendanceSummary,
};
