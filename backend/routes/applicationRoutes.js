// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();

// Middleware (NO MULTER IMPORT HERE!)
const { protect, ngoOnly, volunteerOrHigher } = require('../middleware/authMiddleware');

// Controllers
const {
  getMyApplications,
  applyToOpportunity,
  getOpportunityApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

// ────────────────────────────────────────────────
// VOLUNTEER ROUTES (no file upload)
// ────────────────────────────────────────────────

// GET my applications
router.get('/my', protect, volunteerOrHigher, getMyApplications);

// POST apply to opportunity (JSON only — NO MULTER!)
router.post('/:opportunityId/apply', protect, volunteerOrHigher, applyToOpportunity);

// ────────────────────────────────────────────────
// NGO ROUTES (no file upload)
// ────────────────────────────────────────────────

// GET applications for one opportunity
router.get('/opportunity/:opportunityId', protect, ngoOnly, getOpportunityApplications);

// PATCH update application status
router.patch('/:applicationId/status', protect, ngoOnly, updateApplicationStatus);

// ────────────────────────────────────────────────
// Validate MongoDB ObjectId params
// ────────────────────────────────────────────────
router.param('opportunityId', (req, res, next, id) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format (24-character hex)',
    });
  }
  next();
});

router.param('applicationId', (req, res, next, id) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid application ID format (24-character hex)',
    });
  }
  next();
});

module.exports = router;