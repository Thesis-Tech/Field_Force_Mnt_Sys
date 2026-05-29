const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const locationRoutes = require('./location.routes');
const attendanceRoutes = require('./attendance.routes');
const taskRoutes = require('./task.routes');
const visitRoutes = require('./visit.routes');
const dashboardRoutes = require('./dashboard.routes');
const exportRoutes = require('./export.routes');
const leaveRoutes = require('./leave.routes');
const geofenceRoutes = require('./geofence.routes');
const expenseRoutes      = require('./expense.routes')
const notificationRoutes = require('./notification.routes')



const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/location', locationRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/tasks', taskRoutes);
router.use('/visits', visitRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/expenses', expenseRoutes);
router.use('/notifications', notificationRoutes);
router.use('/export', exportRoutes);
router.use('/leave', leaveRoutes);

module.exports = router;
