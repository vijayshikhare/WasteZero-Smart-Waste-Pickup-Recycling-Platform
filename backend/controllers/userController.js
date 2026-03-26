// controllers/userController.js
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Pickup = require('../models/Pickup');
const Application = require('../models/Application');

// ────────────────────────────────────────────────
// Get User Profile
// ────────────────────────────────────────────────
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get another user's basic info (by ID)
// ────────────────────────────────────────────────
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Update User Profile
// ────────────────────────────────────────────────
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, skills, location, address } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (bio) updateData.bio = bio.trim();
    if (skills && Array.isArray(skills)) updateData.skills = skills;
    if (location) updateData.location = location.trim();
    if (address) updateData.address = address.trim();

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: user.name,
      userRole: user.role,
      action: 'profile_update',
      description: 'Updated profile information',
      targetId: req.user._id,
      targetType: 'user',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get User Dashboard Stats
// ────────────────────────────────────────────────
exports.getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const submittedApplications = await Application.countDocuments({ user_id: userId });
    const acceptedApplications = await Application.countDocuments({
      user_id: userId,
      status: 'accepted',
    });
    const scheduledPickups = await Pickup.countDocuments({
      user_id: userId,
      status: { $in: ['scheduled', 'in-progress'] },
    });
    const completedPickups = await Pickup.countDocuments({
      user_id: userId,
      status: 'completed',
    });

    const unreadNotifications = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    // calculate total waste from completed pickups
    const wasteAgg = await Pickup.aggregate([
      { $match: { user_id: userId, status: 'completed' } },
      { $group: { _id: null, totalKg: { $sum: '$quantityKg' } } },
    ]);
    const totalWasteKg = (wasteAgg[0]?.totalKg || 0) + ' kg';

    res.status(200).json({
      applications: {
        submitted: submittedApplications,
        accepted: acceptedApplications,
      },
      pickups: {
        scheduled: scheduledPickups,
        completed: completedPickups,
      },
      notifications: {
        unread: unreadNotifications,
      },
      totalWasteKg,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get User Notifications
// ────────────────────────────────────────────────
exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, isRead } = req.query;

    const filter = { userId: req.user._id };
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(filter);

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
// Mark Notification as Read
// ────────────────────────────────────────────────
exports.markNotificationAsRead = async (req, res) => {
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
// Mark All Notifications as Read
// ────────────────────────────────────────────────
exports.markAllNotificationsAsRead = async (req, res) => {
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
// Get User Statistics
// ────────────────────────────────────────────────
exports.getUserStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalPickups = await Pickup.countDocuments({ user_id: userId });
    const totalApplications = await Application.countDocuments({ user_id: userId });
    const wasteCollected = await Pickup.aggregate([
      { $match: { user_id: userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalWeight: { $sum: '$quantityKg' },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      totalPickups,
      totalApplications,
      wasteStats: wasteCollected[0] || { totalWeight: 0, totalCount: 0 },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching statistics', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Create a new pickup request
// ────────────────────────────────────────────────
exports.createPickup = async (req, res) => {
  try {
    const { location, wasteType, quantityKg, scheduledDate } = req.body;
    if (!location || !wasteType || !quantityKg) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const pickup = await Pickup.create({
      user_id: req.user._id,
      location: location.trim(),
      wasteType,
      quantityKg,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      status: 'scheduled',
    });

    // Optionally log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'pickup_scheduled',
      description: 'User scheduled a new pickup',
      targetId: pickup._id,
      targetType: 'pickup',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ message: 'Pickup scheduled', pickup });
  } catch (err) {
    res.status(500).json({ message: 'Error creating pickup', error: err.message });
  }
};

// ────────────────────────────────────────────────
// List pickups for current user
// ────────────────────────────────────────────────
exports.getUserPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ user_id: req.user._id }).sort({ scheduledDate: -1 });
    res.status(200).json({ pickups });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pickups', error: err.message });
  }
};
