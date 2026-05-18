const express = require('express');
const visitController = require('../../controllers/visit.controller');
const { authenticate, authorize, checkOrgAccess } = require('../../middleware/auth.middleware');

const router = express.Router();

// Apply auth to all visit routes
router.use(authenticate);
router.use(checkOrgAccess);

// Routes
router.post('/', authorize('FIELD_STAFF'), visitController.createVisitReport);
router.get('/', visitController.listVisitReports); // Restricts to FIELD_STAFF own inside service
router.get('/:id', visitController.getVisitReportById);

module.exports = router;
