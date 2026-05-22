const express = require('express');
const taskController = require('../../controllers/task.controller');
const { authenticate, authorize, checkOrgAccess } = require('../../middleware/auth.middleware');

const router = express.Router();

// Apply auth to all task routes
router.use(authenticate);
router.use(checkOrgAccess);

// Base CRUD
router.post('/', authorize('ADMIN', 'MANAGER'), taskController.createTask);
router.get('/', taskController.listTasks); // Filter logic handles FIELD_STAFF vs MANAGER inside service
router.get('/:id', taskController.getTaskById);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), taskController.updateTask);
router.delete('/:id', authorize('ADMIN'), taskController.deleteTask);


// Assignments status updates
router.patch('/:id/assignments/:assignmentId', taskController.updateAssignmentStatus);

// Comments logs
router.post('/:id/comments', taskController.addComment);
router.get('/:id/comments', taskController.listComments);

module.exports = router;
