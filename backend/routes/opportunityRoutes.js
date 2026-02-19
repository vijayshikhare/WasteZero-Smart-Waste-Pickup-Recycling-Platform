// routes/opportunityRoutes.js
const express = require('express');
const router = express.Router();

const upload = require('../middleware/multer'); // your multer config
const { protect, ngoOnly } = require('../middleware/authMiddleware');

const {
  getAllOpportunities,
  getMyOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');

// ────────────────────────────────────────────────
// Public / Authenticated Routes
// ────────────────────────────────────────────────

// GET all open opportunities (visible to logged-in users/volunteers)
router.get('/', protect, getAllOpportunities);

// ────────────────────────────────────────────────
// NGO-Only Protected Routes
// ────────────────────────────────────────────────

// GET my posted opportunities (only for NGOs)
router.get('/my', protect, ngoOnly, getMyOpportunities);

// POST create new opportunity (NGO only, with image upload)
router.post(
  '/',
  protect,
  ngoOnly,
  upload.single('image'), // field name must match frontend FormData.append('image', file)
  createOpportunity
);

// PUT update existing opportunity (NGO only, optional image)
router.put(
  '/:id',
  protect,
  ngoOnly,
  upload.single('image'),
  updateOpportunity
);

// DELETE remove opportunity (NGO only)
router.delete('/:id', protect, ngoOnly, deleteOpportunity);

// Optional: Validate :id param is valid ObjectId (MongoDB style)
router.param('id', (req, res, next, id) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid opportunity ID format',
    });
  }
  next();
});

module.exports = router;