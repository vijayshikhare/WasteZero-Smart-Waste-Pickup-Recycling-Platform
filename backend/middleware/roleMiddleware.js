// middleware/roleMiddleware.js
const roleMiddleware = {
  // Check if user is admin
  requireAdmin: (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized - No user found' });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: 'Error in admin middleware', error: err.message });
    }
  },

  // Check if user is NGO
  requireNGO: (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized - No user found' });
      }

      if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - NGO access required' });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: 'Error in NGO middleware', error: err.message });
    }
  },

  // Check if user is volunteer
  requireVolunteer: (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized - No user found' });
      }

      if (req.user.role !== 'volunteer' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - Volunteer access required' });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: 'Error in volunteer middleware', error: err.message });
    }
  },

  // Allow access to multiple roles
  requireRoles: (allowedRoles = []) => {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({ message: 'Unauthorized - No user found' });
        }

        const isAllowed = allowedRoles.includes(req.user.role) || req.user.role === 'admin';

        if (!isAllowed) {
          return res.status(403).json({ 
            message: `Forbidden - Access requires one of: ${allowedRoles.join(', ')}` 
          });
        }

        next();
      } catch (err) {
        return res.status(500).json({ message: 'Error in roles middleware', error: err.message });
      }
    };
  },

  // Check if user is active/not suspended
  requireActiveUser: (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized - No user found' });
      }

      if (req.user.isSuspended) {
        return res.status(403).json({ 
          message: 'Your account has been suspended. Please contact admin.' 
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: 'Error checking user status', error: err.message });
    }
  },
};

module.exports = roleMiddleware;
