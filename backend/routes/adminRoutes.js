// routes/adminRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware.protect);
router.use(roleMiddleware.requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.post('/users/:userId/suspend', adminController.suspendUser);
router.post('/users/:userId/activate', adminController.activateUser);

// Content Management
router.delete('/opportunities/:opportunityId', adminController.removeOpportunity);

// Reports
router.get('/reports', adminController.getAllReports);
router.put('/reports/:reportId', adminController.updateReportStatus);

// Activity Logs
router.get('/activity-logs', adminController.getActivityLogs);

// Analytics
router.get('/analytics', adminController.getAnalyticsReport);

module.exports = router;
