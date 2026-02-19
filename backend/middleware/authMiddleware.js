// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

/**
 * Protect routes - verifies JWT from cookie or Authorization header
 * Attaches decoded user { id, role } to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Primary: httpOnly cookie (most secure)
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Fallback: Bearer token (mobile, Postman, external clients)
  else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach minimal user info
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // Optional: log successful auth (only in dev)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH] User ${req.user.id} (${req.user.role}) authenticated`);
    }

    next();
  } catch (error) {
    console.error('[AUTH PROTECT]', {
      error: error.name,
      message: error.message,
      tokenPreview: token.substring(0, 20) + (token.length > 20 ? '...' : ''),
    });

    let status = 401;
    let message = 'Not authorized - invalid token';

    if (error.name === 'TokenExpiredError') {
      message = 'Not authorized - token has expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Not authorized - malformed token';
    } else if (error.name === 'NotBeforeError') {
      message = 'Not authorized - token not yet active';
    }

    return res.status(status).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Restrict route to admin users only
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied - administrators only',
    });
  }
  next();
};

/**
 * Restrict route to NGO users only
 */
const ngoOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ngo') {
    return res.status(403).json({
      success: false,
      message: 'Access denied - NGOs only',
    });
  }
  next();
};

/**
 * Allow volunteers, NGOs, and admins (most common protected routes)
 */
const volunteerOrHigher = (req, res, next) => {
  if (!req.user || !['volunteer', 'ngo', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied - minimum volunteer role required',
    });
  }
  next();
};

module.exports = {
  protect,
  adminOnly,
  ngoOnly,
  volunteerOrHigher,
};