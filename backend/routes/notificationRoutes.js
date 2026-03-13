// routes/notificationRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Protect all notification routes
router.use(authMiddleware.protect);

// Get notifications
router.get('/unread-count', notificationController.getUnreadCount);
router.get('/', notificationController.getAllNotifications);

// Mark as read
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete
router.delete('/:notificationId', notificationController.deleteNotification);
router.delete('/', notificationController.deleteAllNotifications);

module.exports = router;
