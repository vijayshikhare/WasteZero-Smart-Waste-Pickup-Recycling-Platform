// controllers/ngoController.js
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Pickup = require('../models/Pickup');

// ────────────────────────────────────────────────
// Get NGO Profile
// ────────────────────────────────────────────────
exports.getNGOProfile = async (req, res) => {
  try {
    const ngo = await User.findById(req.user._id).select('-password');
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ message: 'NGO not found' });
    }

    const opportunitiesCreated = await Opportunity.countDocuments({ ngo_id: req.user._id });
    const applicationsReceived = await Application.countDocuments({
      opportunity_id: { $in: await Opportunity.find({ ngo_id: req.user._id }).select('_id') },
    });

    res.status(200).json({
      ngo,
      statistics: {
        opportunitiesCreated,
        applicationsReceived,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching NGO profile', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Update NGO Profile
// ────────────────────────────────────────────────
exports.updateNGOProfile = async (req, res) => {
  try {
    const { name, bio, location, address } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (bio) updateData.bio = bio.trim();
    if (location) updateData.location = location.trim();
    if (address) updateData.address = address.trim();

    const ngo = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: ngo.name,
      userRole: ngo.role,
      action: 'profile_update',
      description: 'Updated NGO profile information',
      targetId: req.user._id,
      targetType: 'user',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      message: 'NGO profile updated successfully',
      ngo,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating NGO profile', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get NGO Dashboard Stats
// ────────────────────────────────────────────────
exports.getNGODashboardStats = async (req, res) => {
  try {
    const ngoId = req.user._id;

    const opportunities = await Opportunity.find({ ngo_id: ngoId });
    const opportunityIds = opportunities.map(o => o._id);

    const activeOpportunities = await Opportunity.countDocuments({
      ngo_id: ngoId,
      status: 'open',
    });

    const totalApplications = await Application.countDocuments({
      opportunity_id: { $in: opportunityIds },
    });

    const pendingApplications = await Application.countDocuments({
      opportunity_id: { $in: opportunityIds },
      status: 'pending',
    });

    const acceptedApplications = await Application.countDocuments({
      opportunity_id: { $in: opportunityIds },
      status: 'accepted',
    });

    // pickup stats for this NGO/user
    const scheduledPickups = await Pickup.countDocuments({ user_id: ngoId, status: { $in: ['scheduled', 'in-progress'] } });
    const completedPickups = await Pickup.countDocuments({ user_id: ngoId, status: 'completed' });
    const totalPickups = scheduledPickups + completedPickups;

    // active volunteers = unique users who applied to their opportunities
    const activeVolunteers = await Application.distinct('user_id', { opportunity_id: { $in: opportunityIds } }).then(arr => arr.length);

    res.status(200).json({
      // root-level stats used by frontend merge
      totalPickups,
      pending: scheduledPickups,
      completed: completedPickups,
      activeVolunteers,
      partnerNGOs: 0,
      // also include nested objects for backward compatibility
      opportunities: {
        total: opportunities.length,
        active: activeOpportunities,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
      },
      pickups: {
        scheduled: scheduledPickups,
        completed: completedPickups,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching NGO dashboard stats', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get NGO Opportunities
// ────────────────────────────────────────────────
exports.getNGOOpportunities = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { ngo_id: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const opportunities = await Opportunity.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Opportunity.countDocuments(filter);

    res.status(200).json({
      opportunities,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching opportunities', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get Applications for NGO's Opportunities
// ────────────────────────────────────────────────
exports.getNGOApplications = async (req, res) => {
  try {
    const { opportunityId, status, page = 1, limit = 10 } = req.query;

    const ngoOpportunities = await Opportunity.find({ ngo_id: req.user._id }).select('_id');
    const opportunityIds = ngoOpportunities.map(o => o._id);

    const filter = { opportunity_id: { $in: opportunityIds } };
    if (opportunityId) filter.opportunity_id = opportunityId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(filter)
      .populate('user_id', 'name email')
      .populate('opportunity_id', 'title')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      applications,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Accept Application
// ────────────────────────────────────────────────
exports.acceptApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { feedback = '' } = req.body;

    const application = await Application.findById(applicationId).populate('opportunity_id');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if NGO owns this opportunity
    if (application.opportunity_id.ngo_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = 'accepted';
    application.feedback = feedback;
    await application.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'application_accepted',
      description: `Accepted application ${application._id}`,
      targetId: applicationId,
      targetType: 'application',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Notify user
    await Notification.create({
      userId: application.user_id,
      title: 'Application Accepted',
      message: `Your application for "${application.opportunity_id.title}" has been accepted!`,
      type: 'application_update',
      relatedId: applicationId,
      relatedType: 'application',
      actionUrl: `/applications/${applicationId}`,
    });

    res.status(200).json({
      message: 'Application accepted successfully',
      application,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error accepting application', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Reject Application
// ────────────────────────────────────────────────
exports.rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { feedback = '' } = req.body;

    const application = await Application.findById(applicationId).populate('opportunity_id');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if NGO owns this opportunity
    if (application.opportunity_id.ngo_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = 'rejected';
    application.feedback = feedback;
    await application.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'application_rejected',
      description: `Rejected application ${application._id}`,
      targetId: applicationId,
      targetType: 'application',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Notify user
    await Notification.create({
      userId: application.user_id,
      title: 'Application Rejected',
      message: `Your application for "${application.opportunity_id.title}" was not accepted. Feedback: ${feedback || 'None provided'}`,
      type: 'application_update',
      relatedId: applicationId,
      relatedType: 'application',
    });

    res.status(200).json({
      message: 'Application rejected successfully',
      application,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting application', error: err.message });
  }
};

// ────────────────────────────────────────────────
// Get NGO Statistics
// ────────────────────────────────────────────────
exports.getNGOStatistics = async (req, res) => {
  try {
    const ngoId = req.user._id;

    const opportunities = await Opportunity.find({ ngo_id: ngoId });
    const opportunityIds = opportunities.map(o => o._id);

    const totalOpportunities = opportunities.length;
    const acceptedApplications = await Application.countDocuments({
      opportunity_id: { $in: opportunityIds },
      status: 'accepted',
    });
    const rejectedApplications = await Application.countDocuments({
      opportunity_id: { $in: opportunityIds },
      status: 'rejected',
    });

    res.status(200).json({
      totalOpportunities,
      acceptedApplications,
      rejectedApplications,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching NGO statistics', error: err.message });
  }
};
