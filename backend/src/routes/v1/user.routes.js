const express = require('express');
const userController = require('../../controllers/user.controller');
const { authenticate, authorize, checkOrgAccess } = require('../../middleware/auth.middleware');

const router = express.Router();

// Apply auth to all user endpoints
router.use(authenticate);
router.use(checkOrgAccess);

// Routes
router.post('/', authorize('ADMIN'), userController.createUser);
router.get('/', authorize('ADMIN', 'MANAGER'), userController.listUsers);
router.get('/:id', authorize('ADMIN', 'MANAGER'), userController.getUserById);
router.patch('/:id', authorize('ADMIN'), userController.updateUser);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

// Territory and Password Operations
router.post('/:id/assign-territory', authorize('ADMIN'), userController.assignTerritory);
router.post('/:id/reset-password', authorize('ADMIN'), userController.forceResetPassword);

// Performance stats
router.get('/:id/performance', authorize('ADMIN', 'MANAGER'), userController.getUserPerformance);


module.exports = router;
