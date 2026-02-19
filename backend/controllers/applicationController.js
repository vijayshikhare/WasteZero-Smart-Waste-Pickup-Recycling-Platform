// controllers/applicationController.js
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');

// ────────────────────────────────────────────────
// VOLUNTEER: Get my own applications
// ────────────────────────────────────────────────
// In getMyApplications
exports.getMyApplications = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log(`[getMyApplications] Fetching for volunteer ${req.user.id}`);

    const applications = await Application.find({ volunteer_id: req.user.id })
      .populate({
        path: 'opportunity_id',
        select: 'title ngo_id location duration status image', // make sure these fields exist
        populate: {
          path: 'ngo_id',
          select: 'name email profilePicture',
        },
      })
      .sort({ appliedAt: -1 })
      .lean();

    console.log(`[getMyApplications] Found ${applications.length} applications`);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('[getMyApplications] ERROR:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your applications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ────────────────────────────────────────────────
// VOLUNTEER: Apply to an opportunity
// ────────────────────────────────────────────────
exports.applyToOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const volunteerId = req.user?.id;

    // Debug logs — must be INSIDE the function
    console.log(`[applyToOpportunity] Attempt by volunteer: ${volunteerId || 'unknown'}`);
    console.log(`[applyToOpportunity] Opportunity ID: ${opportunityId}`);
    console.log(`[applyToOpportunity] Request body:`, req.body);

    if (!volunteerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - user not found',
      });
    }

    // 1. Opportunity must exist and be open
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    if (opportunity.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This opportunity is no longer accepting applications',
      });
    }

    // 2. Prevent duplicate applications
    const existing = await Application.findOne({
      opportunity_id: opportunityId,
      volunteer_id: volunteerId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this opportunity',
      });
    }

    // 3. Create new application
    const application = await Application.create({
      opportunity_id: opportunityId,
      volunteer_id: volunteerId,
      status: 'pending',
      appliedAt: new Date(),
    });

    console.log(`[applyToOpportunity] SUCCESS — Created application ID: ${application._id}`);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    console.error('[applyToOpportunity] ERROR:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ────────────────────────────────────────────────
// NGO: Get all applications for one of their opportunities
// ────────────────────────────────────────────────
exports.getOpportunityApplications = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - user not found',
      });
    }

    console.log(`[getOpportunityApplications] NGO ${req.user.id} requesting apps for opportunity ${opportunityId}`);

    const opportunity = await Opportunity.findById(opportunityId).select('ngo_id title');
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    if (opportunity.ngo_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view applications for this opportunity',
      });
    }

    const applications = await Application.find({ opportunity_id: opportunityId })
      .populate('volunteer_id', 'name email profilePicture phone') // phone is optional
      .sort({ appliedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('[getOpportunityApplications] ERROR:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications for this opportunity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ────────────────────────────────────────────────
// NGO: Accept or Reject a pending application
// ────────────────────────────────────────────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, note } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - user not found',
      });
    }

    console.log(`[updateApplicationStatus] NGO ${req.user.id} updating application ${applicationId} to ${status}`);

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "accepted" or "rejected"',
      });
    }

    const application = await Application.findById(applicationId)
      .populate({
        path: 'opportunity_id',
        select: 'ngo_id title',
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.opportunity_id.ngo_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this application',
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This application is already ${application.status}`,
      });
    }

    application.status = status;
    application.reviewedAt = new Date();
    if (note?.trim()) {
      application.note = note.trim(); // only works if you added 'note' field to Application schema
    }

    await application.save();

    console.log(`[updateApplicationStatus] SUCCESS — Application ${applicationId} updated to ${status}`);

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application,
    });
  } catch (error) {
    console.error('[updateApplicationStatus] ERROR:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};