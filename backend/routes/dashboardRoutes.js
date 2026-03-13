// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();

const { protect, ngoOnly, volunteerOrHigher } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// NGO stats
router.get('/ngo-stats', protect, ngoOnly, dashboardController.getNgoStats);

// Volunteer stats
router.get('/volunteer-stats', protect, volunteerOrHigher, dashboardController.getVolunteerStats);

// Optional: Admin stats (if you need it later)
// router.get('/admin-stats', protect, adminOnly, dashboardController.getAdminStats);

module.exports = router;