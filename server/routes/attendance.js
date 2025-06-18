const express = require('express');
const { body, param, query } = require('express-validator');
// const auth = require('../middleware/auth');
const {
  createAttendance,
  bulkCreateAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  checkOut,
  deleteAttendance,
  getAttendanceStats,
  getMemberAttendanceHistory
} = require('../controllers/attendanceController');

const router = express.Router();

/**
 * Attendance Routes for Haven Word Church
 * All routes require authentication
 * 
 * Features:
 * - CRUD operations with proper validation
 * - Role-based access control
 * - Bulk operations support
 * - Statistics and reporting
 * - Member-specific attendance tracking
 * 
 * @author Haven Word Church Development Team
 * @version 1.0.0
 */

/**
 * Validation middleware for creating attendance
 */
const validateCreateAttendance = [
  body('user')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  
  body('activityType')
    .isIn(['service', 'event', 'ministry', 'prayer_meeting', 'bible_study', 'youth_service', 'children_service'])
    .withMessage('Valid activity type is required'),
  
  body('activityId')
    .isMongoId()
    .withMessage('Valid activity ID is required'),
  
  body('activityTitle')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Activity title must be between 1 and 200 characters'),
  
  body('attendanceDate')
    .optional()
    .isISO8601()
    .withMessage('Valid attendance date is required'),
  
  body('checkInTime')
    .optional()
    .isISO8601()
    .withMessage('Valid check-in time is required'),
  
  body('status')
    .optional()
    .isIn(['present', 'late', 'left_early', 'partial'])
    .withMessage('Valid status is required'),
  
  body('isFirstTime')
    .optional()
    .isBoolean()
    .withMessage('isFirstTime must be a boolean'),
  
  body('guestBroughtBy')
    .optional()
    .isMongoId()
    .withMessage('Valid guest referrer ID is required'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  body('weatherCondition')
    .optional()
    .isIn(['sunny', 'rainy', 'harmattan', 'cloudy', 'stormy'])
    .withMessage('Valid weather condition is required'),
  
  body('transportationMode')
    .optional()
    .isIn(['walking', 'bus', 'car', 'motorcycle', 'bicycle', 'tricycle', 'online'])
    .withMessage('Valid transportation mode is required'),
  
  body('recordingMethod')
    .optional()
    .isIn(['manual', 'qr_code', 'rfid', 'mobile_app', 'web_portal'])
    .withMessage('Valid recording method is required')
];

/**
 * Validation middleware for bulk attendance creation
 */
const validateBulkAttendance = [
  body('attendanceRecords')
    .isArray({ min: 1 })
    .withMessage('Attendance records array is required'),
  
  body('attendanceRecords.*.user')
    .isMongoId()
    .withMessage('Valid user ID is required for each record'),
  
  body('attendanceRecords.*.activityType')
    .isIn(['service', 'event', 'ministry', 'prayer_meeting', 'bible_study', 'youth_service', 'children_service'])
    .withMessage('Valid activity type is required for each record'),
  
  body('attendanceRecords.*.activityId')
    .isMongoId()
    .withMessage('Valid activity ID is required for each record'),
  
  body('attendanceRecords.*.activityTitle')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Activity title must be between 1 and 200 characters for each record')
];

/**
 * Validation middleware for updating attendance
 */
const validateUpdateAttendance = [
  param('id')
    .isMongoId()
    .withMessage('Valid attendance ID is required'),
  
  body('status')
    .optional()
    .isIn(['present', 'late', 'left_early', 'partial'])
    .withMessage('Valid status is required'),
  
  body('checkOutTime')
    .optional()
    .isISO8601()
    .withMessage('Valid check-out time is required'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('transportationMode')
    .optional()
    .isIn(['walking', 'bus', 'car', 'motorcycle', 'bicycle', 'tricycle', 'online'])
    .withMessage('Valid transportation mode is required'),
  
  body('weatherCondition')
    .optional()
    .isIn(['sunny', 'rainy', 'harmattan', 'cloudy', 'stormy'])
    .withMessage('Valid weather condition is required'),
  
  body('recordingMethod')
    .optional()
    .isIn(['manual', 'qr_code', 'rfid', 'mobile_app', 'web_portal'])
    .withMessage('Valid recording method is required')
];

/**
 * Validation middleware for getting attendance by ID
 */
const validateGetAttendanceById = [
  param('id')
    .isMongoId()
    .withMessage('Valid attendance ID is required')
];

/**
 * Validation middleware for member attendance history
 */
const validateMemberAttendanceHistory = [
  param('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  
  query('activityType')
    .optional()
    .isIn(['service', 'event', 'ministry', 'prayer_meeting', 'bible_study', 'youth_service', 'children_service'])
    .withMessage('Valid activity type is required'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation middleware for attendance statistics
 */
const validateAttendanceStats = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  
  query('activityType')
    .optional()
    .isIn(['service', 'event', 'ministry', 'prayer_meeting', 'bible_study', 'youth_service', 'children_service'])
    .withMessage('Valid activity type is required'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters')
];

/**
 * Validation middleware for getting all attendance
 */
const validateGetAllAttendance = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('activityType')
    .optional()
    .isIn(['service', 'event', 'ministry', 'prayer_meeting', 'bible_study', 'youth_service', 'children_service'])
    .withMessage('Valid activity type is required'),
  
  query('activityId')
    .optional()
    .isMongoId()
    .withMessage('Valid activity ID is required'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  
  query('status')
    .optional()
    .isIn(['present', 'late', 'left_early', 'partial'])
    .withMessage('Valid status is required'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  query('isFirstTime')
    .optional()
    .isBoolean()
    .withMessage('isFirstTime must be a boolean'),
  
  query('sortBy')
    .optional()
    .isIn(['attendanceDate', 'checkInTime', 'status', 'activityType'])
    .withMessage('Valid sort field is required'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

/**
 * Middleware to check if user has admin or usher role
 */
const requireAdminOrUsher = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'usher') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Usher role required.'
    });
  }
  next();
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

/**
 * Middleware to check if user can access attendance record
 * (Admin, Usher, or record owner)
 */
const canAccessAttendance = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    
    // Admin and ushers can access any record
    if (req.user.role === 'admin' || req.user.role === 'usher') {
      return next();
    }
    
    // For member attendance history, check if accessing own records
    if (userId && userId === req.user.id) {
      return next();
    }
    
    // For specific attendance record, check ownership
    if (id) {
      const Attendance = require('../models/Attendance');
      const attendance = await Attendance.findById(id);
      
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }
      
      if (attendance.user.toString() === req.user.id) {
        return next();
      }
    }
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own attendance records.'
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking access permissions'
    });
  }
};

// ===============================
// ATTENDANCE ROUTES
// ===============================

/**
 * @route   POST /api/attendance
 * @desc    Create new attendance record
 * @access  Private (Admin, Usher)
 */
router.post('/', 
  validateCreateAttendance, 
  createAttendance
);

/**
 * @route   POST /api/attendance/bulk
 * @desc    Create multiple attendance records
 * @access  Private (Admin, Usher)
 */
router.post('/bulk', 
  validateBulkAttendance, 
  bulkCreateAttendance
);

/**
 * @route   GET /api/attendance/stats
 * @desc    Get attendance statistics
 * @access  Private (Admin, Usher)
 */
router.get('/stats', 
  validateAttendanceStats, 
  getAttendanceStats
);

/**
 * @route   GET /api/attendance/member/:userId
 * @desc    Get member attendance history
 * @access  Private (Admin, Usher, Owner)
 */
router.get('/member/:userId', 
  validateMemberAttendanceHistory, 
  getMemberAttendanceHistory
);

/**
 * @route   GET /api/attendance
 * @desc    Get all attendance records with filtering
 * @access  Private (Admin, Usher)
 */
router.get('/', 
  validateGetAllAttendance, 
  getAllAttendance
);

/**
 * @route   GET /api/attendance/:id
 * @desc    Get attendance record by ID
 * @access  Private (Admin, Usher, Owner)
 */
router.get('/:id', 
  validateGetAttendanceById, 
  getAttendanceById
);

/**
 * @route   PUT /api/attendance/:id
 * @desc    Update attendance record
 * @access  Private (Admin, Usher)
 */
router.put('/:id', 
  validateUpdateAttendance, 
  updateAttendance
);

/**
 * @route   PATCH /api/attendance/:id/checkout
 * @desc    Check out attendance (mark departure)
 * @access  Private (Admin, Usher, Owner)
 */
router.patch('/:id/checkout', 
  validateGetAttendanceById, 
  checkOut
);

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Soft delete attendance record
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  validateGetAttendanceById, 
  deleteAttendance
);

module.exports = router;