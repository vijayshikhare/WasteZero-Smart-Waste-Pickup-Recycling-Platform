// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  sendOtp,
  verifyOtp,
  setPassword,
} = require('../controllers/authController');

// ────────────────────────────────────────────────
// Multer configuration (only used for profile update)
// ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // make sure this folder exists!
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed (jpg, jpeg, png, webp)'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter,
});

// ────────────────────────────────────────────────
// PUBLIC ROUTES — No authentication required
// ────────────────────────────────────────────────

// Password-based registration
router.post('/register', register);

// Password-based login
router.post('/login', login);

// OTP flow
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Logout (clears cookie — can be public)
router.post('/logout', logout);

// ────────────────────────────────────────────────
// PROTECTED ROUTES — Require valid JWT cookie
// ────────────────────────────────────────────────

// Get current user profile
router.get('/profile', protect, getProfile);

// Update profile (supports text fields + photo upload + password change)
router.patch(
  '/profile',
  protect,
  upload.single('profilePicture'),   // ← multer middleware for file upload
  updateProfile
);

// Allow OTP-only users to set a password after login
router.post('/set-password', protect, setPassword);

module.exports = router;