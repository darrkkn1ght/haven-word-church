/**
 * Authentication Routes for Haven Word Church
 * Defines all authentication-related API endpoints
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  logout
} = require('../controllers/authController');

const router = express.Router();

/**
 * Validation middleware for handling express-validator errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Registration validation rules
 */
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('phone')
    .optional()
    .matches(/^(\+234|0)[789][01]\d{8}$/)
    .withMessage('Please provide a valid Nigerian phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female'])
    .withMessage('Gender must be either Male or Female'),
  
  body('maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed'])
    .withMessage('Please select a valid marital status')
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Password change validation rules
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

/**
 * Password reset validation rules
 */
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

/**
 * Email validation rules
 */
const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

/**
 * Token validation rules
 */
const tokenValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token is required')
];

// =============================================================================
// PUBLIC ROUTES (No authentication required)
// =============================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, handleValidationErrors, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, handleValidationErrors, login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', emailValidation, handleValidationErrors, forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, resetPassword);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address with token
 * @access  Public
 */
router.post('/verify-email', tokenValidation, handleValidationErrors, verifyEmail);

// =============================================================================
// PROTECTED ROUTES (Authentication required)
// =============================================================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth.protect, getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth.protect, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^(\+234|0)[789][01]\d{8}$/)
    .withMessage('Please provide a valid Nigerian phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female'])
    .withMessage('Gender must be either Male or Female'),
  
  body('maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed'])
    .withMessage('Please select a valid marital status'),
  
  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation must not exceed 100 characters'),
  
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters')
  
], handleValidationErrors, updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', auth.protect, changePasswordValidation, handleValidationErrors, changePassword);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post('/resend-verification', auth.protect, resendVerification);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth.protect, logout);

// =============================================================================
// ROUTE TESTING ENDPOINTS (Development only)
// =============================================================================

if (process.env.NODE_ENV === 'development') {
  /**
   * @route   GET /api/auth/test
   * @desc    Test authentication routes
   * @access  Public
   */
  router.get('/test', (req, res) => {
    res.json({
      success: true,
      message: 'Haven Word Church Authentication Routes are working!',
      timestamp: new Date().toISOString(),
      timezone: 'Africa/Lagos'
    });
  });

  /**
   * @route   GET /api/auth/protected-test
   * @desc    Test protected route
   * @access  Private
   */
  router.get('/protected-test', auth.protect, (req, res) => {
    res.json({
      success: true,
      message: 'Protected route is working!',
      user: req.user,
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = router;