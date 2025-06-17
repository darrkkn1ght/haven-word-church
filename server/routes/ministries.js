const express = require('express');
const {
  getMinistries,
  getMinistry,
  getMinistriesByCategory,
  getFeaturedMinistries,
  getMinistrySummaries,
  createMinistry,
  updateMinistry,
  deleteMinistry,
  updateMemberCount,
  addActivity,
  updateGoalStatus,
  getMinistryStats
} = require('../controllers/ministryController');
const { protect, adminOnly, leadersOnly } = require('../middleware/auth');

/**
 * Ministry Routes for Haven Word Church
 * Handles all ministry-related API endpoints
 * 
 * Public Routes:
 * - GET /api/ministries - Get all ministries with filtering
 * - GET /api/ministries/featured - Get featured ministries
 * - GET /api/ministries/summaries - Get ministry summaries
 * - GET /api/ministries/category/:category - Get ministries by category
 * - GET /api/ministries/:identifier - Get single ministry
 * 
 * Protected Routes (Admin only):
 * - POST /api/ministries - Create ministry
 * - PUT /api/ministries/:id - Update ministry
 * - DELETE /api/ministries/:id - Delete ministry
 * - GET /api/ministries/stats - Get ministry statistics
 * 
 * Protected Routes (Admin/Leader):
 * - PATCH /api/ministries/:id/members - Update member count
 * - POST /api/ministries/:id/activities - Add activity
 * - PATCH /api/ministries/:id/goals/:goalId - Update goal status
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

const router = express.Router();

// Public routes - no authentication required
// These routes are accessible to all visitors

/**
 * @route   GET /api/ministries
 * @desc    Get all ministries with filtering and pagination
 * @access  Public
 * @params  page, limit, status, category, type, featured, search
 */
router.get('/', getMinistries);

/**
 * @route   GET /api/ministries/featured
 * @desc    Get featured ministries
 * @access  Public
 * @params  limit (optional, default: 6)
 */
router.get('/featured', getFeaturedMinistries);

/**
 * @route   GET /api/ministries/summaries
 * @desc    Get ministry summaries for cards/listings
 * @access  Public
 * @params  limit (optional, default: 20)
 */
router.get('/summaries', getMinistrySummaries);

/**
 * @route   GET /api/ministries/category/:category
 * @desc    Get ministries by category
 * @access  Public
 * @params  category (worship, children, youth, men, women, etc.)
 */
router.get('/category/:category', getMinistriesByCategory);

// Admin-only routes - require authentication and admin privileges

/**
 * @route   GET /api/ministries/stats
 * @desc    Get ministry statistics and analytics
 * @access  Private (Admin only)
 */
router.get('/stats', protect, adminOnly, getMinistryStats);

/**
 * @route   POST /api/ministries
 * @desc    Create new ministry
 * @access  Private (Admin only)
 * @body    Ministry object with all required fields
 */
router.post('/', protect, adminOnly, createMinistry);

/**
 * @route   PUT /api/ministries/:id
 * @desc    Update ministry by ID
 * @access  Private (Admin only)
 * @params  id - Ministry ID
 * @body    Updated ministry fields
 */
router.put('/:id', protect, adminOnly, updateMinistry);

/**
 * @route   DELETE /api/ministries/:id
 * @desc    Delete ministry by ID
 * @access  Private (Admin only)
 * @params  id - Ministry ID
 */
router.delete('/:id', protect, adminOnly, deleteMinistry);

// Admin/Leader routes - require authentication and admin or leader privileges

/**
 * @route   PATCH /api/ministries/:id/members
 * @desc    Update ministry member count
 * @access  Private (Admin/Leader only)
 * @params  id - Ministry ID
 * @body    { count: number }
 */
router.patch('/:id/members', protect, leadersOnly, updateMemberCount);

/**
 * @route   POST /api/ministries/:id/activities
 * @desc    Add new activity to ministry
 * @access  Private (Admin/Leader only)
 * @params  id - Ministry ID
 * @body    { title, description, date, location }
 */
router.post('/:id/activities', protect, leadersOnly, addActivity);

/**
 * @route   PATCH /api/ministries/:id/goals/:goalId
 * @desc    Update ministry goal status
 * @access  Private (Admin/Leader only)
 * @params  id - Ministry ID, goalId - Goal ID
 * @body    { status: 'not-started'|'in-progress'|'completed'|'on-hold' }
 */
router.patch('/:id/goals/:goalId', protect, leadersOnly, updateGoalStatus);

/**
 * @route   GET /api/ministries/:identifier
 * @desc    Get single ministry by ID or slug
 * @access  Public (with visibility restrictions)
 * @params  identifier - Ministry ID or slug
 * @note    Must be placed last to avoid conflicts with other routes
 */
router.get('/:identifier', getMinistry);

module.exports = router;