// routes/ngoRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ngoController = require('../controllers/ngoController');

const router = express.Router();

// Protect all NGO routes
router.use(authMiddleware.protect);
router.use(roleMiddleware.requireNGO);
router.use(roleMiddleware.requireActiveUser);

// NGO Profile
router.get('/profile', ngoController.getNGOProfile);
router.put('/profile', ngoController.updateNGOProfile);

// Dashboard
router.get('/dashboard/stats', ngoController.getNGODashboardStats);

// Opportunities
router.get('/opportunities', ngoController.getNGOOpportunities);

// Applications
router.get('/applications', ngoController.getNGOApplications);
router.post('/applications/:applicationId/accept', ngoController.acceptApplication);
router.post('/applications/:applicationId/reject', ngoController.rejectApplication);

// Statistics
router.get('/statistics', ngoController.getNGOStatistics);

module.exports = router;
