const jwt = require('jsonwebtoken');
const { asyncHandler } = require('./errorHandler');
const { ErrorResponse } = require('./errorHandler');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token from "Bearer TOKEN"
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (if using cookie-based auth)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token and attach to request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new ErrorResponse('No user found with this token', 401));
    }

    // Check if user is active
    if (!req.user.isActive) {
      return next(new ErrorResponse('User account is deactivated', 401));
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

// Check if user is admin
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('User not authenticated', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Access denied. Admin rights required', 403));
  }

  next();
};

// Check if user is member or higher
const membersOnly = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('User not authenticated', 401));
  }

  const allowedRoles = ['member', 'leader', 'pastor', 'admin'];
  
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ErrorResponse('Access denied. Member access required', 403));
  }

  next();
};

// Check if user is leader or higher
const leadersOnly = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('User not authenticated', 401));
  }

  const allowedRoles = ['leader', 'pastor', 'admin'];
  
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ErrorResponse('Access denied. Leadership access required', 403));
  }

  next();
};

// Optional authentication - doesn't require login but attaches user if logged in
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid but continue without user
      console.log('Optional auth - invalid token:', error.message);
    }
  }

  next();
});

// Rate limiting for sensitive operations
const sensitiveRateLimit = (req, res, next) => {
  // This can be enhanced with more sophisticated rate limiting
  // For now, we'll use the IP-based rate limiting from express-rate-limit
  next();
};

module.exports = {
  protect,
  authorize,
  adminOnly,
  membersOnly,
  leadersOnly,
  optionalAuth,
  sensitiveRateLimit
};