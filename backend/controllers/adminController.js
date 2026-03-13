// controllers/adminController.js
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Report = require('../models/Report');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// ────────────────────────────────────────────────
// Get Dashboard Statistics
// ────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $in: ['volunteer', 'ngo'] } });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalNGOs = await User.countDocuments({ role: 'ngo' });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    const totalOpportunities = await Opportunity.countDocuments();
    const openOpportunities = await Opportunity.countDocuments({ status: 'open' });
    const completedOpportunities = await Opportunity.countDocuments({ status: 'completed' });

    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });

    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const reviewingReports = await Report.countDocuments({ status: 'reviewing' });

    const recentActivityCount = await ActivityLog.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    res.status(200).json({
      users: {
        total: totalUsers,
        volunteers: totalVolunteers,
        ngos: totalNGOs,
        suspended: suspendedUsers,
      },
      opportunities: {
        total: totalOpportunities,
        open: openOpportunities,
        completed: completedOpportunities,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
      },
      reports: {
        pending: pendingReports,
        reviewing: reviewingReports,
      },
      recentActivity: recentActivityCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get All Users with Filters
// ────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isSuspended, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isSuspended === 'true') filter.isSuspended = true;
    if (isSuspended === 'false') filter.isSuspended = { $ne: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get User Details with Activity
// ────────────────────────────────────────────────
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const recentActivity = await ActivityLog.find({ userId })
      .limit(20)
      .sort({ createdAt: -1 });

    const createdOpportunities = await Opportunity.countDocuments({ ngo_id: userId });
    const submittedApplications = await Application.countDocuments({ user_id: userId });

    res.status(200).json({
      user,
      recentActivity,
      statistics: {
        createdOpportunities,
        submittedApplications,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user details', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Suspend User
// ────────────────────────────────────────────────
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason = 'No reason provided' } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: true, suspensionReason: reason },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'user_suspended',
      description: `Suspended user: ${user.name}. Reason: ${reason}`,
      targetId: userId,
      targetType: 'user',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Notify the suspended user
    await Notification.create({
      userId,
      title: 'Account Suspended',
      message: `Your account has been suspended. Reason: ${reason}`,
      type: 'user_suspended',
      relatedType: 'user',
    });

    res.status(200).json({
      message: 'User suspended successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error suspending user', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Activate User
// ────────────────────────────────────────────────
exports.activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: false, suspensionReason: '' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'user_activated',
      description: `Activated user: ${user.name}`,
      targetId: userId,
      targetType: 'user',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      message: 'User activated successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error activating user', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Remove Opportunity
// ────────────────────────────────────────────────
exports.removeOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { reason = 'No reason provided' } = req.body;

    const opportunity = await Opportunity.findByIdAndDelete(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Log the activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'opportunity_post_removed',
      description: `Removed opportunity: ${opportunity.title}. Reason: ${reason}`,
      targetId: opportunityId,
      targetType: 'opportunity',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Notify NGO
    await Notification.create({
      userId: opportunity.ngo_id,
      title: 'Post Removed',
      message: `Your opportunity "${opportunity.title}" has been removed by admin. Reason: ${reason}`,
      type: 'system_alert',
      relatedType: 'opportunity',
    });

    res.status(200).json({
      message: 'Opportunity removed successfully',
    });
  } catch (err) {
    res.status(500).json({ message: 'Error removing opportunity', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get All Reports
// ────────────────────────────────────────────────
exports.getAllReports = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find({ status })
      .populate('reporterId', 'name email')
      .populate('targetUserId', 'name email')
      .populate('resolvedBy', 'name')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments({ status });

    res.status(200).json({
      reports,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reports', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Update Report Status
// ────────────────────────────────────────────────
exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, actionTaken, adminNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        actionTaken: actionTaken || 'none',
        adminNotes: adminNotes || '',
        resolvedBy: status === 'resolved' ? req.user._id : null,
      },
      { new: true }
    ).populate('reporterId', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Log the activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'report_viewed',
      description: `Updated report status to: ${status}. Action: ${actionTaken}`,
      targetId: reportId,
      targetType: 'report',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      message: 'Report updated successfully',
      report,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating report', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get Activity Logs
// ────────────────────────────────────────────────
exports.getActivityLogs = async (req, res) => {
  try {
    const { action, userId, userRole, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (userRole) filter.userRole = userRole;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await ActivityLog.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching activity logs', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get Analytics Report
// ────────────────────────────────────────────────
exports.getAnalyticsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = dateFilter ? { createdAt: dateFilter } : {};

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { role: { $in: ['volunteer', 'ngo'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Opportunity statistics
    const opportunityStats = await Opportunity.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Application statistics
    const applicationStats = await Application.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Report statistics
    const reportStats = await Report.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      userGrowth,
      opportunityStats,
      applicationStats,
      reportStats,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
};
