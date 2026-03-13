// routes/applicationRoutes.js
const express = require('express');
const mongoose = require('mongoose'); // Required for ObjectId validation

const router = express.Router();

// Middleware
const { protect, ngoOnly, volunteerOrHigher } = require('../middleware/authMiddleware');

// Controllers
const {
  getMyApplications,
  applyToOpportunity,
  getOpportunityApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

// Safety check: crash early if critical handlers missing
if (!getMyApplications || !applyToOpportunity) {
  console.error('[APPLICATION ROUTES FATAL] Missing required controller methods');
  process.exit(1);
}

/**
 * VOLUNTEER ROUTES (no file upload)
 */
router.get('/my', protect, volunteerOrHigher, getMyApplications);

router.post('/:opportunityId/apply', protect, volunteerOrHigher, applyToOpportunity);

/**
 * NGO ROUTES (no file upload)
 */
router.get('/opportunity/:opportunityId', protect, ngoOnly, getOpportunityApplications);

router.patch('/:applicationId/status', protect, ngoOnly, updateApplicationStatus);

/**
 * Parameter validation for MongoDB ObjectIds
 * Called separately for each param name
 */
router.param('opportunityId', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunityId format — must be a valid MongoDB ObjectId (24 hex chars)',
      errorCode: 'INVALID_ID',
    });
  }
  next();
});

router.param('applicationId', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid applicationId format — must be a valid MongoDB ObjectId (24 hex chars)',
      errorCode: 'INVALID_ID',
    });
  }
  next();
});

module.exports = router;