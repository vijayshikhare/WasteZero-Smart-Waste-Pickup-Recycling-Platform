// All secrets and sensitive configuration must be loaded from environment variables only.
// Do not hardcode secrets or tokens in this file.
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

/**
 * Protect routes - verifies JWT from cookie or Authorization header
 * Attaches decoded user { id, role } to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Prefer httpOnly cookie (most secure for browser clients)
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  // 2. Fallback: Bearer token (useful for Postman, mobile apps, etc.)
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('[AUTH PROTECT] No token found', {
      hasCookie: !!req.cookies?.accessToken,
      hasBearer: !!req.headers.authorization,
      url: req.originalUrl,
    });

    return res.status(401).json({
      success: false,
      message: 'Not authorized - no authentication token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // Helpful dev logging - remove or reduce in production
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH PROTECT] SUCCESS → User ${req.user.id} (${req.user.role}) on ${req.method} ${req.originalUrl}`);
    }

    next();
  } catch (error) {
    // Detailed dev logging to help debug 401s
    if (process.env.NODE_ENV === 'development') {
      console.error('[AUTH PROTECT] Verification failed:', {
        errorName: error.name,
        errorMessage: error.message,
        tokenPreview: token.length > 10 ? token.substring(0, 10) + '...' : token,
        url: req.originalUrl,
      });
    }

    let status = 401;
    let message = 'Not authorized - invalid or expired token';

    if (error.name === 'TokenExpiredError') {
      message = 'Session expired - please log in again';
      status = 401; // could be 440 in some conventions, but 401 is standard
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid authentication token';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token not yet valid';
    }

    return res.status(status).json({
      success: false,
      message,
      // Only expose in dev - helps debugging without leaking in prod
      ...(process.env.NODE_ENV === 'development' && { debug: error.message }),
    });
  }
});

/**
 * Restrict to admin users only
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied - administrator privileges required',
    });
  }
  next();
};

/**
 * Restrict to NGO users only
 */
const ngoOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ngo') {
    return res.status(403).json({
      success: false,
      message: 'Access denied - NGO account required',
    });
  }
  next();
};

/**
 * Allow volunteers, NGOs, and admins
 * Useful for routes that multiple roles can access
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