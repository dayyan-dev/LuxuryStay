const jwt = require('jsonwebtoken');
const User = require('../Models/User');

// ============================================================
// PROTECT — verify access token
// ============================================================
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.', code: 'TOKEN_EXPIRED' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.', code: 'TOKEN_INVALID' });
    }
    res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

// ============================================================
// ROLE-BASED ACCESS CONTROL
// ============================================================

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }
  next();
};

// Admin + Manager
const managerOrAdmin = (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manager or Admin only.',
    });
  }
  next();
};

// Specific staff roles
const staffRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required roles: ${roles.join(', ')}`,
    });
  }
  next();
};

// Owner or Staff (Admins/Managers/Receptionists can view any; user can view own)
const ownerOrStaff = (req, res, next) => {
  if (['admin', 'manager', 'receptionist', 'staff'].includes(req.user.role)) {
    return next();
  }
  if (req.params.userId && req.user._id && req.user._id.toString() === req.params.userId.toString()) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own profile.',
  });
};

// ============================================================
// OPTIONAL AUTH — attach user if token present, don't block
// ============================================================
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch {
    // Ignore errors — user just won't be attached
  }
  next();
};

module.exports = { protect, adminOnly, managerOrAdmin, staffRoles, ownerOrStaff, optionalAuth };
