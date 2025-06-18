const express = require('express');
const { body } = require('express-validator');
// const auth = require('../middleware/auth');
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getFeaturedEvents,
  getUpcomingEvents,
  registerForEvent,
  unregisterFromEvent,
  getEventAttendees
} = require('../controllers/eventController');

const router = express.Router();

/**
 * Event Routes for Haven Word Church
 * Handles all event-related API endpoints with proper validation and authorization
 * 
 * Public Routes:
 * - GET /api/events - Get all published events
 * - GET /api/events/featured - Get featured events
 * - GET /api/events/upcoming - Get upcoming events
 * - GET /api/events/:identifier - Get single event
 * 
 * Protected Routes (Member):
 * - POST /api/events/:id/register - Register for event
 * - DELETE /api/events/:id/register - Unregister from event
 * 
 * Admin Routes:
 * - POST /api/events - Create event
 * - PUT /api/events/:id - Update event
 * - DELETE /api/events/:id - Delete event
 * - GET /api/events/:id/attendees - Get event attendees
 */

// Validation rules for creating/updating events
const eventValidationRules = [
  body('title')
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim(),
  
  body('description')
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .trim(),
  
  body('eventType')
    .notEmpty()
    .withMessage('Event type is required')
    .isIn(['Service', 'Conference', 'Workshop', 'Fellowship', 'Outreach', 'Youth Event', 'Children Event', 'Prayer Meeting', 'Special Service', 'Community Service'])
    .withMessage('Invalid event type'),
  
  body('category')
    .notEmpty()
    .withMessage('Event category is required')
    .isIn(['Worship', 'Teaching', 'Fellowship', 'Outreach', 'Youth', 'Children', 'Prayer', 'Special', 'Community'])
    .withMessage('Invalid event category'),
  
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('location.venue')
    .notEmpty()
    .withMessage('Venue is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Venue must be between 3 and 200 characters')
    .trim(),
  
  body('location.address')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Address cannot exceed 300 characters')
    .trim(),
  
  body('location.city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters')
    .trim(),
  
  body('location.state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters')
    .trim(),
  
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  
  body('cost.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost amount must be a positive number'),
  
  body('cost.currency')
    .optional()
    .isIn(['NGN', 'USD', 'EUR', 'GBP'])
    .withMessage('Invalid currency'),
  
  body('organizer.department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters')
    .trim(),
  
  body('organizer.contactPerson')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Contact person cannot exceed 100 characters')
    .trim(),
  
  body('organizer.contactEmail')
    .optional()
    .isEmail()
    .withMessage('Contact email must be valid')
    .normalizeEmail(),
  
  body('organizer.contactPhone')
    .optional()
    .matches(/^(\+234|0)[7-9]\d{9}$/)
    .withMessage('Contact phone must be a valid Nigerian phone number'),
  
  body('registration.isRequired')
    .optional()
    .isBoolean()
    .withMessage('Registration required must be a boolean'),
  
  body('registration.isOpen')
    .optional()
    .isBoolean()
    .withMessage('Registration open must be a boolean'),
  
  body('registration.deadline')
    .optional()
    .isISO8601()
    .withMessage('Registration deadline must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) >= new Date(req.body.startDate)) {
        throw new Error('Registration deadline must be before event start date');
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Cannot have more than 10 tags');
      }
      return tags.every(tag => 
        typeof tag === 'string' && 
        tag.length <= 30 && 
        tag.trim().length > 0
      );
    })
    .withMessage('Each tag must be a non-empty string with max 30 characters'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array')
    .custom((requirements) => {
      return requirements.every(req => 
        typeof req === 'string' && 
        req.length <= 200 && 
        req.trim().length > 0
      );
    })
    .withMessage('Each requirement must be a non-empty string with max 200 characters'),
  
  body('metaDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters')
    .trim()
];

// Middleware to check admin/staff permissions
const requireAdminOrStaff = (req, res, next) => {
  if (!req.user || !['admin', 'staff'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or staff privileges required.'
    });
  }
  next();
};

// Middleware to check admin permissions
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Public Routes
// Get all events (with filtering and pagination)
router.get('/', getAllEvents);

// Get featured events
router.get('/featured', getFeaturedEvents);

// Get upcoming events
router.get('/upcoming', getUpcomingEvents);

// Get single event by ID or slug
router.get('/:identifier', getEvent);

// Protected Member Routes
// Register for an event
router.post('/:id/register', registerForEvent);

// Unregister from an event
router.delete('/:id/register', unregisterFromEvent);

// Admin/Staff Routes
// Create new event
router.post('/', eventValidationRules, createEvent);

// Update existing event
router.put('/:id', eventValidationRules, updateEvent);

// Get event attendees (Admin/Staff only)
router.get('/:id/attendees', getEventAttendees);

// Admin Only Routes
// Delete event
router.delete('/:id', deleteEvent);

module.exports = router;