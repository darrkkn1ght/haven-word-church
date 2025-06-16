const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  addInternalNote,
  assignContact,
  getContactStats,
  getOverdueContacts,
  deleteContact
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Contact Routes for Haven Word Church
 * Handles all contact-related API endpoints
 * 
 * @description Defines routes for contact management with proper authentication and rate limiting
 * @author Haven Word Church Development Team
 * @version 1.0.0
 */

// Rate limiting for contact form submissions (public endpoint)
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 contact form submissions per windowMs
  message: {
    success: false,
    message: 'Too many contact form submissions. Please try again in 15 minutes.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many contact form submissions from this IP. Please try again in 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiting for staff operations (more lenient)
const staffOperationsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per windowMs for staff operations
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    retryAfter: 5 * 60
  },
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user && req.user.role === 'admin';
  }
});

/**
 * @route   POST /api/contacts
 * @desc    Create a new contact submission (Public endpoint)
 * @access  Public
 * @rateLimit 3 submissions per 15 minutes per IP
 */
router.post('/', contactFormLimiter, createContact);

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts with filtering and pagination
 * @access  Private (Staff, Pastor, Admin)
 * @query   page, limit, status, contactType, priority, assignedTo, search, startDate, endDate, sortBy, sortOrder
 */
router.get('/', 
  protect, 
  authorize('staff', 'pastor', 'admin'), 
  staffOperationsLimiter,
  getContacts
);

/**
 * @route   GET /api/contacts/stats
 * @desc    Get contact statistics and analytics
 * @access  Private (Pastor, Admin)
 * @query   period (days)
 */
router.get('/stats', 
  protect, 
  authorize('pastor', 'admin'), 
  staffOperationsLimiter,
  getContactStats
);

/**
 * @route   GET /api/contacts/overdue
 * @desc    Get overdue contacts
 * @access  Private (Staff, Pastor, Admin)
 * @query   days (default: 3)
 */
router.get('/overdue', 
  protect, 
  authorize('staff', 'pastor', 'admin'), 
  staffOperationsLimiter,
  getOverdueContacts
);

/**
 * @route   GET /api/contacts/:id
 * @desc    Get single contact by ID
 * @access  Private (Staff, Pastor, Admin)
 * @param   id - Contact ID
 */
router.get('/:id', 
  protect, 
  authorize('staff', 'pastor', 'admin'), 
  staffOperationsLimiter,
  getContactById
);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update contact status, assignment, and other details
 * @access  Private (Staff, Pastor, Admin)
 * @param   id - Contact ID
 * @body    status, assignedTo, priority, followUpRequired, followUpDate, tags, responseMessage
 */
router.put('/:id', 
  protect, 
  authorize('staff', 'pastor', 'admin'), 
  staffOperationsLimiter,
  updateContact
);

/**
 * @route   POST /api/contacts/:id/notes
 * @desc    Add internal note to contact
 * @access  Private (Staff, Pastor, Admin)
 * @param   id - Contact ID
 * @body    note - Note content
 */
router.post('/:id/notes', 
  protect, 
  authorize('staff', 'pastor', 'admin'), 
  staffOperationsLimiter,
  addInternalNote
);

/**
 * @route   PUT /api/contacts/:id/assign
 * @desc    Assign contact to staff member
 * @access  Private (Pastor, Admin)
 * @param   id - Contact ID
 * @body    assignedTo - Staff member ID (null to unassign)
 */
router.put('/:id/assign', 
  protect, 
  authorize('pastor', 'admin'), 
  staffOperationsLimiter,
  assignContact
);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete contact (Admin only)
 * @access  Private (Admin only)
 * @param   id - Contact ID
 */
router.delete('/:id', 
  protect, 
  authorize('admin'), 
  staffOperationsLimiter,
  deleteContact
);

// Export router
module.exports = router;