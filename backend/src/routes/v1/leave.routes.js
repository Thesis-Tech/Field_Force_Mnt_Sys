const router = require('express').Router()
const controller = require('../../controllers/leave.controller')
const { authenticate, authorize } = require('../../middleware/auth.middleware')
const { validate } = require('../../middleware/validate.middleware')  // adjust path if different
const { applyLeaveSchema, approveRejectSchema } = require('../../validations/leave.validation')

// Any logged-in user
router.post('/apply',            authenticate, validate(applyLeaveSchema),   controller.apply)
router.get('/my',                authenticate,                                controller.myLeaves)
router.get('/balance',           authenticate,                                controller.balance)
router.delete('/:id',            authenticate,                                controller.cancel)

// Manager + Admin
router.get('/team',              authenticate, authorize('MANAGER','ADMIN'),  controller.teamLeaves)
router.put('/:id/approve',       authenticate, authorize('MANAGER','ADMIN'),  validate(approveRejectSchema), controller.approve)
router.put('/:id/reject',        authenticate, authorize('MANAGER','ADMIN'),  validate(approveRejectSchema), controller.reject)

// Admin only
router.get('/all',               authenticate, authorize('ADMIN'),            controller.allLeaves)

module.exports = router