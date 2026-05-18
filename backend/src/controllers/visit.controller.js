const visitService = require('../services/visit.service');
const { successResponse } = require('../utils/response');
const { createVisitReportSchema } = require('../validations/visit.validation');
const { BadRequestError } = require('../utils/errors');

/**
 * Create Visit Report
 */
const createVisitReport = async (req, res, next) => {
  try {
    const parseResult = createVisitReportSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new BadRequestError('Validation failed', parseResult.error.flatten().fieldErrors);
    }

    const result = await visitService.createVisitReport(req.user.id, parseResult.data, req.user.organizationId);

    await req.logAudit({
      action: 'CREATE_VISIT_REPORT',
      resource: 'VisitReport',
      resourceId: result.id,
      newValues: result
    });

    return successResponse(res, result, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * List Visit Reports
 */
const listVisitReports = async (req, res, next) => {
  try {
    const { userId, visitType, visitStatus, startDate, endDate, search, page, limit, sortBy, sortOrder } = req.query;

    const result = await visitService.listVisitReports({
      organizationId: req.user.organizationId,
      role: req.user.role,
      requestingUserId: req.user.id,
      userId,
      visitType,
      visitStatus,
      startDate,
      endDate,
      search,
      page,
      limit,
      sortBy,
      sortOrder
    });

    return successResponse(res, result.visits, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Visit Report by ID
 */
const getVisitReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const visit = await visitService.getVisitReportById(id, req.user.organizationId);
    return successResponse(res, visit);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createVisitReport,
  listVisitReports,
  getVisitReportById
};
