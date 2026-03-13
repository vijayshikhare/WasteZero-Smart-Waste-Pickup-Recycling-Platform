const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const upload = require('../middleware/multer');
const { protect, ngoOnly } = require('../middleware/authMiddleware');

const opportunityController = require('../controllers/opportunityController');

const {
  getAllOpportunities,
  getMyOpportunities,
  createOpportunity,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityApplications,
} = opportunityController;

// Safety check for missing handlers
if (
  !getAllOpportunities ||
  !getMyOpportunities ||
  !createOpportunity ||
  !updateOpportunity ||
  !deleteOpportunity
) {
  console.error('[OPPORTUNITY ROUTES FATAL] Missing required controller methods');
  process.exit(1);
}

// Debug: log registered handlers on startup (comment out in production)
console.log('[Opportunity Routes] Registered:', {
  getAll: !!getAllOpportunities,
  getMy: !!getMyOpportunities,
  create: !!createOpportunity,
  getById: !!getOpportunityById,
  update: !!updateOpportunity,
  delete: !!deleteOpportunity,
  getApplications: !!getOpportunityApplications,
});

/**
 * Public / Lightly Protected Routes
 */
router.get('/', getAllOpportunities);  // List all open opportunities - PUBLIC

/**
 * NGO-Only Specific Routes (MUST COME BEFORE :id routes!)
 */
router.get('/my', protect, ngoOnly, getMyOpportunities);  // My opportunities - fixed order

// Create (no :id)
router.post('/', protect, ngoOnly, upload.single('image'), createOpportunity);

// ────────────────────────────────────────────────
// Routes with :id - after all non-parametric routes
// ────────────────────────────────────────────────
router.get('/:id', getOpportunityById);  // View single opportunity - PUBLIC

router.put('/:id', protect, ngoOnly, upload.single('image'), updateOpportunity);

router.delete('/:id', protect, ngoOnly, deleteOpportunity);

router.get('/:id/applications', protect, ngoOnly, getOpportunityApplications);

/**
 * Global :id validation (now only applies to routes that actually have :id)
 */
router.param('id', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format — must be a valid MongoDB ObjectId (24 hex chars)',
      errorCode: 'INVALID_ID',
    });
  }
  next();
});

module.exports = router;