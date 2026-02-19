// controllers/opportunityController.js
const Opportunity = require('../models/Opportunity');
const multer = require('multer');
const path = require('path');

// ────────────────────────────────────────────────
// Multer setup for opportunity images
// ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/opportunities');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `opp-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, webp) are allowed'));
  },
}).single('image'); // field name must be 'image' in FormData

// ────────────────────────────────────────────────
// GET /api/opportunities
// Get all open opportunities (visible to everyone)
// ────────────────────────────────────────────────
exports.getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ status: 'open' })
      .populate('ngo_id', 'name email profilePicture') // show NGO name/email/photo
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    console.error('[getAllOpportunities] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ────────────────────────────────────────────────
// GET /api/opportunities/my
// NGO only: Get their own posted opportunities
// ────────────────────────────────────────────────
exports.getMyOpportunities = async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Only NGOs can view their posted opportunities',
      });
    }

    const opportunities = await Opportunity.find({ ngo_id: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    console.error('[getMyOpportunities] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your posted opportunities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ────────────────────────────────────────────────
// POST /api/opportunities
// NGO only: Create new opportunity (with optional image)
// ────────────────────────────────────────────────
exports.createOpportunity = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed',
      });
    }

    try {
      if (req.user.role !== 'ngo') {
        return res.status(403).json({
          success: false,
          message: 'Only NGOs can create opportunities',
        });
      }

      const { title, description, required_skills, duration, location } = req.body;

      if (!title?.trim() || !description?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required',
        });
      }

      const opportunity = await Opportunity.create({
        ngo_id: req.user.id,
        title: title.trim(),
        description: description.trim(),
        required_skills: Array.isArray(required_skills)
          ? required_skills.map(s => s.trim()).filter(Boolean)
          : required_skills?.split(',').map(s => s.trim()).filter(Boolean) || [],
        duration: duration?.trim() || 'Flexible',
        location: location?.trim() || 'Not specified',
        image: req.file ? `/uploads/opportunities/${req.file.filename}` : null,
        status: 'open',
      });

      res.status(201).json({
        success: true,
        message: 'Opportunity created successfully',
        data: opportunity,
      });
    } catch (error) {
      console.error('[createOpportunity] Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to create opportunity',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });
};

// ────────────────────────────────────────────────
// PUT /api/opportunities/:id
// NGO only: Update their own opportunity (image optional)
// ────────────────────────────────────────────────
exports.updateOpportunity = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed',
      });
    }

    try {
      const opportunity = await Opportunity.findOne({
        _id: req.params.id,
        ngo_id: req.user.id,
      });

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: 'Opportunity not found or you do not have permission',
        });
      }

      const { title, description, required_skills, duration, location } = req.body;

      if (title?.trim()) opportunity.title = title.trim();
      if (description?.trim()) opportunity.description = description.trim();

      if (required_skills !== undefined) {
        opportunity.required_skills = Array.isArray(required_skills)
          ? required_skills.map(s => s.trim()).filter(Boolean)
          : required_skills?.split(',').map(s => s.trim()).filter(Boolean) || [];
      }

      if (duration !== undefined) opportunity.duration = duration?.trim() || 'Flexible';
      if (location !== undefined) opportunity.location = location?.trim() || 'Not specified';

      // Replace image only if new file uploaded
      if (req.file) {
        opportunity.image = `/uploads/opportunities/${req.file.filename}`;
      }

      await opportunity.save();

      res.status(200).json({
        success: true,
        message: 'Opportunity updated successfully',
        data: opportunity,
      });
    } catch (error) {
      console.error('[updateOpportunity] Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to update opportunity',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });
};

// ────────────────────────────────────────────────
// DELETE /api/opportunities/:id
// NGO only: Delete their own opportunity
// ────────────────────────────────────────────────
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findOneAndDelete({
      _id: req.params.id,
      ngo_id: req.user.id,
    });

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found or you do not have permission',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully',
    });
  } catch (error) {
    console.error('[deleteOpportunity] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete opportunity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};