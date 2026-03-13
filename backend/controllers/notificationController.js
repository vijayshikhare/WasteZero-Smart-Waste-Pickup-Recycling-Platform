// controllers/notificationController.js
const Notification = require('../models/Notification');

// ────────────────────────────────────────────────
// Get Unread Count
// ────────────────────────────────────────────────
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching unread count', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get All Notifications
// ────────────────────────────────────────────────
exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find({ userId: req.user._id })
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments({ userId: req.user._id });

    res.status(200).json({
      notifications,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Mark as Read
// ────────────────────────────────────────────────
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Mark All as Read
// ────────────────────────────────────────────────
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notifications', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Delete Notification
// ────────────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      message: 'Notification deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting notification', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Delete All Notifications
// ────────────────────────────────────────────────
exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });

    res.status(200).json({
      message: 'All notifications deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting notifications', error: err.message });
  }
};
