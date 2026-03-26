// routes/userRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// Protect all user routes
router.use(authMiddleware.protect);
router.use(roleMiddleware.requireActiveUser);

// Profile
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

// get other user by id (for chat, etc.)
router.get('/:id', userController.getUserById);

// Dashboard
router.get('/dashboard/stats', userController.getUserDashboardStats);

// Pickups
router.post('/pickups', userController.createPickup);
router.get('/pickups', userController.getUserPickups);

// Notifications (integrated)
router.get('/notifications', userController.getUserNotifications);
router.put('/notifications/:notificationId/read', userController.markNotificationAsRead);
router.put('/notifications/mark-all-read', userController.markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', userController.deleteNotification);

// Statistics
router.get('/statistics', userController.getUserStatistics);

module.exports = router;
