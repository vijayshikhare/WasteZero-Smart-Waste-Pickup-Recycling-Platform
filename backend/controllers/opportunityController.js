const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const asyncHandler = require('express-async-handler');
const fs = require('fs').promises;
const path = require('path');

// Helpers
const safeTrim = (val) => (typeof val === 'string' ? val.trim() : '');
const safeSkills = (skills) =>
  Array.isArray(skills)
    ? skills.map(safeTrim).filter(Boolean)
    : typeof skills === 'string'
    ? skills.split(',').map(safeTrim).filter(Boolean)
    : [];

// ────────────────────────────────────────────────
// GET /api/opportunities
// Public – all open opportunities
// ────────────────────────────────────────────────
exports.getAllOpportunities = asyncHandler(async (req, res) => {
  const opportunities = await Opportunity.find({ status: 'open' })
    .populate('ngo_id', 'name email profilePicture')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    count: opportunities.length,
    data: opportunities,
  });
});

// ────────────────────────────────────────────────
// GET /api/opportunities/my
// NGO only – their own opportunities
// ────────────────────────────────────────────────
exports.getMyOpportunities = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ngo') {
    res.status(403);
    throw new Error('Only NGOs can view their posted opportunities');
  }

  const opportunities = await Opportunity.find({ ngo_id: req.user.id })
    .populate('ngo_id', 'name email profilePicture') // consistent population
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    count: opportunities.length,
    data: opportunities,
  });
});

// ────────────────────────────────────────────────
// POST /api/opportunities
// Create new opportunity (NGO only)
// ────────────────────────────────────────────────
exports.createOpportunity = asyncHandler(async (req, res) => {
  console.log('[CREATE OPPORTUNITY] Request by user:', req.user?.id, req.user?.role);
  console.log('[CREATE] Has file?', !!req.file);
  console.log('[CREATE] Body:', req.body);

  if (req.user.role !== 'ngo') {
    res.status(403);
    throw new Error('Only NGOs can create opportunities');
  }

  const { title, description, required_skills, duration, location, status } = req.body;

  const safeTitle = safeTrim(title);
  const safeDesc = safeTrim(description);

  if (!safeTitle) {
    res.status(400);
    throw new Error('Title is required (minimum 5 characters after trimming)');
  }

  if (!safeDesc) {
    res.status(400);
    throw new Error('Description is required (minimum 20 characters after trimming)');
  }

  // accept custom status if valid (NGOs may create closed/completed directly)
  const allowedStatus = ['open', 'closed', 'completed'];
  const initialStatus = allowedStatus.includes(status) ? status : 'open';

  const opportunity = await Opportunity.create({
    ngo_id: req.user.id,
    title: safeTitle,
    description: safeDesc,
    required_skills: safeSkills(required_skills),
    duration: safeTrim(duration) || 'Flexible',
    location: safeTrim(location) || 'Not specified',
    image: req.file ? `/uploads/${req.file.filename}` : undefined,
    status: initialStatus,
  });

  res.status(201).json({
    success: true,
    message: 'Opportunity created successfully',
    data: opportunity,
  });
});

// ────────────────────────────────────────────────
// GET /api/opportunities/:id
// Single opportunity (public)
// ────────────────────────────────────────────────
exports.getOpportunityById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error('Invalid opportunity ID format');
  }

  const opportunity = await Opportunity.findById(req.params.id)
    .populate('ngo_id', 'name email profilePicture')
    .lean();

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  res.json({
    success: true,
    data: opportunity,
  });
});

// ────────────────────────────────────────────────
// PUT /api/opportunities/:id
// Update opportunity (NGO only, own only)
// ────────────────────────────────────────────────
exports.updateOpportunity = asyncHandler(async (req, res) => {
  console.log('[UPDATE OPPORTUNITY] ID:', req.params.id);
  console.log('[UPDATE] User:', req.user?.id, req.user?.role);
  console.log('[UPDATE] Has new file?', !!req.file);

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error('Invalid opportunity ID format');
  }

  const opportunity = await Opportunity.findOne({
    _id: req.params.id,
    ngo_id: req.user.id,
  });

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found or you do not own it');
  }

  const { title, description, required_skills, duration, location, status } = req.body;

  // Update only provided fields
  if (title !== undefined) opportunity.title = safeTrim(title);
  if (description !== undefined) opportunity.description = safeTrim(description);
  if (required_skills !== undefined) opportunity.required_skills = safeSkills(required_skills);
  if (duration !== undefined) opportunity.duration = safeTrim(duration);
  if (location !== undefined) opportunity.location = safeTrim(location);
  if (status !== undefined && ['open', 'closed', 'completed'].includes(status)) {
    opportunity.status = status;
  }

  // Handle new image (optional)
  if (req.file) {
    // Optional: delete old image from disk
    if (opportunity.image) {
      const oldPath = path.join(__dirname, '..', 'public', opportunity.image.replace(/^\//, ''));
      try {
        await fs.unlink(oldPath);
        console.log('[UPDATE] Deleted old image:', oldPath);
      } catch (err) {
        console.warn('[UPDATE] Failed to delete old image:', err.message);
      }
    }

    opportunity.image = `/uploads/${req.file.filename}`;
  }

  await opportunity.save();

  res.json({
    success: true,
    message: 'Opportunity updated successfully',
    data: opportunity,
  });
});

// ────────────────────────────────────────────────
// DELETE /api/opportunities/:id
// Delete opportunity (NGO only, own only)
// ────────────────────────────────────────────────
exports.deleteOpportunity = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error('Invalid opportunity ID format');
  }

  const opportunity = await Opportunity.findOneAndDelete({
    _id: req.params.id,
    ngo_id: req.user.id,
  });

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found or you do not own it');
  }

  // Optional: delete associated image
  if (opportunity.image) {
    const imagePath = path.join(__dirname, '..', 'public', opportunity.image.replace(/^\//, ''));
    try {
      await fs.unlink(imagePath);
      console.log('[DELETE] Removed image:', imagePath);
    } catch (err) {
      console.warn('[DELETE] Failed to delete image:', err.message);
    }
  }

  res.json({
    success: true,
    message: 'Opportunity deleted successfully',
  });
});

// ────────────────────────────────────────────────
// GET /api/opportunities/:id/applications
// List applications for a specific opportunity (NGO only, own only)
// ────────────────────────────────────────────────
exports.getOpportunityApplications = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error('Invalid opportunity ID format');
  }

  const opportunity = await Opportunity.findOne({
    _id: req.params.id,
    ngo_id: req.user.id,
  });

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found or you do not own it');
  }

  const applications = await Application.find({ opportunity_id: req.params.id })
    .populate('volunteer_id', 'name email profilePicture')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    count: applications.length,
    data: applications,
  });
});