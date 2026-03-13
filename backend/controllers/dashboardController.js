// controllers/dashboardController.js
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// ────────────────────────────────────────────────
// GET /api/dashboard/ngo-stats
// Returns stats for NGO dashboard (no pickup dependency)
// ────────────────────────────────────────────────
exports.getNgoStats = async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - NGOs only',
      });
    }

    const ngoId = req.user.id;

    // Total opportunities created by this NGO
    const totalOpportunities = await Opportunity.countDocuments({ ngo_id: ngoId });

    // Open opportunities
    const openOpportunities = await Opportunity.countDocuments({
      ngo_id: ngoId,
      status: 'open',
    });

    // Closed/completed opportunities
    const closedOpportunities = await Opportunity.countDocuments({
      ngo_id: ngoId,
      status: { $in: ['closed', 'completed'] },
    });

    // Total applications received (across all their opportunities)
    const totalApplications = await Application.countDocuments({
      opportunity_id: { $in: await Opportunity.find({ ngo_id: ngoId }).distinct('_id') },
    });

    // Pending applications
    const pendingApplications = await Application.countDocuments({
      opportunity_id: { $in: await Opportunity.find({ ngo_id: ngoId }).distinct('_id') },
      status: 'pending',
    });

    // Active volunteers (example: any volunteer who applied to their opps)
    const activeVolunteers = await User.countDocuments({
      role: 'volunteer',
      // optional: lastActive > 30 days ago, etc.
    });

    res.status(200).json({
      success: true,
      data: {
        totalOpportunities,
        openOpportunities,
        closedOpportunities,
        totalApplications,
        pendingApplications,
        activeVolunteers,
      },
    });
  } catch (error) {
    console.error('[getNgoStats] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NGO dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ────────────────────────────────────────────────
// GET /api/dashboard/volunteer-stats
// Returns stats for Volunteer dashboard
// ────────────────────────────────────────────────
exports.getVolunteerStats = async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - volunteers only',
      });
    }

    const volunteerId = req.user.id;

    const appliedOpportunities = await Application.countDocuments({
      volunteer_id: volunteerId,
    });

    const acceptedApplications = await Application.countDocuments({
      volunteer_id: volunteerId,
      status: 'accepted',
    });

    const pendingApplications = await Application.countDocuments({
      volunteer_id: volunteerId,
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      data: {
        appliedOpportunities,
        acceptedApplications,
        pendingApplications,
      },
    });
  } catch (error) {
    console.error('[getVolunteerStats] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};