const Ministry = require('../models/Ministry');
const asyncHandler = require('express-async-handler');

/**
 * Ministry Controller for Haven Word Church
 * Handles all ministry-related operations
 * 
 * Features:
 * - CRUD operations for ministries
 * - Ministry search and filtering
 * - Category-based queries
 * - Leadership management
 * - Member management
 * - Activity tracking
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

/**
 * @desc    Get all ministries with filtering and pagination
 * @route   GET /api/ministries
 * @access  Public
 */
const getMinistries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query object
  let query = {};
  
  // Filter by status (default to active for public access)
  const status = req.query.status || 'active';
  if (status !== 'all') {
    query.status = status;
  }

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by type
  if (req.query.type) {
    query.type = req.query.type;
  }

  // Filter by featured
  if (req.query.featured === 'true') {
    query.featured = true;
  }

  // Search functionality
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Visibility filter (public access should only see public and members-only)
  if (!req.user || !req.user.isAdmin) {
    query.visibility = { $in: ['public', 'members-only'] };
  }

  try {
    const ministries = await Ministry.find(query)
      .sort({ featured: -1, name: 1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Ministry.countDocuments(query);

    res.json({
      success: true,
      count: ministries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: ministries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ministries',
      error: error.message
    });
  }
});

/**
 * @desc    Get single ministry by ID or slug
 * @route   GET /api/ministries/:identifier
 * @access  Public
 */
const getMinistry = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  
  try {
    // Try to find by ID first, then by slug
    let ministry = await Ministry.findById(identifier);
    if (!ministry) {
      ministry = await Ministry.findOne({ slug: identifier });
    }

    if (!ministry) {
      return res.status(404).json({
        success: false,
        message: 'Ministry not found'
      });
    }

    // Check visibility permissions
    if (ministry.visibility === 'private' && (!req.user || !req.user.isAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this ministry'
      });
    }

    res.json({
      success: true,
      data: ministry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ministry',
      error: error.message
    });
  }
});

/**
 * @desc    Get ministries by category
 * @route   GET /api/ministries/category/:category
 * @access  Public
 */
const getMinistriesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  try {
    const ministries = await Ministry.getActiveByCategory(category);

    res.json({
      success: true,
      count: ministries.length,
      category,
      data: ministries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ministries by category',
      error: error.message
    });
  }
});

/**
 * @desc    Get featured ministries
 * @route   GET /api/ministries/featured
 * @access  Public
 */
const getFeaturedMinistries = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  
  try {
    const ministries = await Ministry.getFeatured(limit);

    res.json({
      success: true,
      count: ministries.length,
      data: ministries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured ministries',
      error: error.message
    });
  }
});

/**
 * @desc    Get ministry summaries for cards/listings
 * @route   GET /api/ministries/summaries
 * @access  Public
 */
const getMinistrySummaries = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  
  try {
    const ministries = await Ministry.find({ 
      status: 'active',
      visibility: { $in: ['public', 'members-only'] }
    })
    .sort({ featured: -1, name: 1 })
    .limit(limit);

    const summaries = ministries.map(ministry => ministry.getSummary());

    res.json({
      success: true,
      count: summaries.length,
      data: summaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ministry summaries',
      error: error.message
    });
  }
});

/**
 * @desc    Create new ministry
 * @route   POST /api/ministries
 * @access  Private (Admin only)
 */
const createMinistry = asyncHandler(async (req, res) => {
  try {
    const ministry = await Ministry.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Ministry created successfully',
      data: ministry
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ministry with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating ministry',
      error: error.message
    });
  }
});

/**
 * @desc    Update ministry
 * @route   PUT /api/ministries/:id
 * @access  Private (Admin only)
 */
const updateMinistry = asyncHandler(async (req, res) => {
  try {
    const ministry = await Ministry.findById(req.params.id);

    if (!ministry) {
      return res.status(404).json({
        success: false,
        message: 'Ministry not found'
      });
    }

    const updatedMinistry = await Ministry.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Ministry updated successfully',
      data: updatedMinistry
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating ministry',
      error: error.message
    });
  }
});

/**
 * @desc    Delete ministry
 * @route   DELETE /api/ministries/:id
 * @access  Private (Admin only)
 */
const deleteMinistry = asyncHandler(async (req, res) => {
  try {
    const ministry = await Ministry.findById(req.params.id);

    if (!ministry) {
      return res.status(404).json({
        success: false,
        message: 'Ministry not found'
      });
    }

    await Ministry.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Ministry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting ministry',
      error: error.message
    });
  }
});

/**
 * @desc    Update ministry member count
 * @route   PATCH /api/ministries/:id/members
 * @access  Private (Admin/Leader only)
 */
const updateMemberCount = asyncHandler(async (req, res) => {
  const { count } = req.body;

  if (typeof count !== 'number' || count < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid member count is required'
    });
  }

  try {
    const ministry = await Ministry.findByIdAndUpdate(
      req.params.id,
      { 'membership.currentCount': count },
      { new: true, runValidators: true }
    );

    if (!ministry) {
      return res.status(404).json({
        success: false,
        message: 'Ministry not found'
      });
    }

    res.json({
      success: true,
      message: 'Member count updated successfully',
      data: {
        id: ministry._id,
        name: ministry.name,
        memberCount: ministry.membership.currentCount,
        memberCountDisplay: ministry.memberCountDisplay
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating member count',
      error: error.message
    });
  }
});

/**
 * @desc    Add ministry activity
 * @route   POST /api/ministries/:id/activities
 * @access  Private (Admin/Leader only)
 */
const addActivity = asyncHandler(async (req, res) => {
  const { title, description, date, location } = req.body;

  if (!title || !date) {
    return res.status(400).json({
      success: false,
      message: 'Activity title and date are required'
    });
  }

  try {
    const ministry = await Ministry.findById(req.params.id);

    if (!ministry) {
      return res.status(404).json({
        success: false,
        message: 'Ministry not found'
      });
    }

    ministry.upcomingActivities.push({
      title,
      description,
      date: new Date(date),
      location
    });

    await ministry.save();

    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      data: ministry.upcomingActivities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding activity',
      error: error.message
    });
  }
});

/**
 * @desc    Update ministry goal status
 * @route   PATCH /api/ministries/:id/goals/:goalId
 * @access  Private (Admin/Leader only)
 */
const updateGoalStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['not-started', 'in-progress', 'completed', 'on-hold'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status provided'
    });
  }

  try {
    const ministry = await Ministry.findOneAndUpdate(
      { _id: req.params.id, 'goals._id': req.params.goalId },
      { $set: { 'goals.$.status': status } },
      { new: true }
    );

    if (!ministry) {
      return res.status(404).json({
        success: false,
        message: 'Ministry or goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal status updated successfully',
      data: ministry.goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating goal status',
      error: error.message
    });
  }
});

/**
 * @desc    Get ministry statistics
 * @route   GET /api/ministries/stats
 * @access  Private (Admin only)
 */
const getMinistryStats = asyncHandler(async (req, res) => {
  try {
    const stats = await Ministry.aggregate([
      {
        $group: {
          _id: null,
          totalMinistries: { $sum: 1 },
          activeMinistries: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalMembers: { $sum: '$membership.currentCount' },
          featuredMinistries: {
            $sum: { $cond: ['$featured', 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalMinistries: 1,
          activeMinistries: 1,
          totalMembers: 1,
          featuredMinistries: 1
        }
      }
    ]);

    const categoryStats = await Ministry.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalMembers: { $sum: '$membership.currentCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalMinistries: 0,
          activeMinistries: 0,
          totalMembers: 0,
          featuredMinistries: 0
        },
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ministry statistics',
      error: error.message
    });
  }
});

module.exports = {
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
};