const Sermon = require('../models/Sermon');
const { validationResult } = require('express-validator');
const getTelegramSermons = require('./getTelegramSermons');
const { logActivity } = require('../utils/activityLogger');

/**
 * Sermon Controller for Haven Word Church
 * Handles all sermon-related operations including CRUD, media management, and analytics
 * 
 * Features:
 * - Complete CRUD operations for sermons
 * - Series management and organization
 * - Media handling (audio, video, transcripts, slides)
 * - Speaker management including guest speakers
 * - Analytics tracking (views, downloads, likes)
 * - Advanced filtering and search capabilities
 * - Nigerian timezone and cultural context
 */

/**
 * Get all published sermons with optional filtering
 * @route GET /api/sermons
 * @access Public
 */
const getAllSermons = async (req, res) => {
  try {
    const {
      category,
      speaker,
      series,
      serviceType,
      status = 'published',
      featured,
      hasMedia,
      tags,
      year,
      month,
      limit = 20,
      page = 1,
      search,
      sortBy = 'serviceDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    let query = {};
    
    // Status filter (public users only see published sermons)
    if (!req.user || req.user.role !== 'admin') {
      query.status = 'published';
    } else if (status && status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Speaker filter
    if (speaker) {
      query['speaker.name'] = { $regex: speaker, $options: 'i' };
    }

    // Series filter
    if (series) {
      query['series.name'] = { $regex: series, $options: 'i' };
    }

    // Service type filter
    if (serviceType) {
      query.serviceType = serviceType;
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Media filter
    if (hasMedia === 'true') {
      query.$or = [
        { 'media.audio.url': { $exists: true, $ne: '' } },
        { 'media.video.url': { $exists: true, $ne: '' } }
      ];
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Date filters
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.serviceDate = { $gte: startDate, $lte: endDate };
    }

    if (month && year) {
      const startDate = new Date(`${year}-${month.padStart(2, '0')}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      query.serviceDate = { $gte: startDate, $lte: endDate };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { scriptureReference: { $regex: search, $options: 'i' } },
        { 'speaker.name': { $regex: search, $options: 'i' } },
        { 'series.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    const sermons = await Sermon.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Sermon.countDocuments(query);

    res.json({
      success: true,
      data: sermons,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all sermons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sermons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single sermon by ID or slug
 * @route GET /api/sermons/:identifier
 * @access Public
 */
const getSermon = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let sermon = await Sermon.findById(identifier).catch(() => null);
    
    if (!sermon) {
      sermon = await Sermon.findOne({ slug: identifier });
    }

    if (!sermon) {
      return res.status(404).json({
        success: false,
        message: 'Sermon not found'
      });
    }

    // Check if user can access this sermon
    if (sermon.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Sermon not found'
      });
    }

    // Populate creator information
    await sermon.populate('createdBy', 'firstName lastName');
    await sermon.populate('lastModifiedBy', 'firstName lastName');

    // Increment view count if this is a public view
    if (sermon.status === 'published') {
      await sermon.incrementViews();
    }

    res.json({
      success: true,
      data: sermon
    });

  } catch (error) {
    console.error('Get sermon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sermon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new sermon
 * @route POST /api/sermons
 * @access Private (Admin/Staff)
 */
const createSermon = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Create sermon with creator information
    const sermonData = {
      ...req.body,
      createdBy: req.user.id
    };

    const sermon = new Sermon(sermonData);
    await sermon.save();

    // Populate creator information
    await sermon.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Sermon created successfully',
      data: sermon
    });

  } catch (error) {
    console.error('Create sermon error:', error);
    
    // Handle duplicate key error (slug)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A sermon with this title already exists for the same date'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating sermon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update existing sermon
 * @route PUT /api/sermons/:id
 * @access Private (Admin/Staff)
 */
const updateSermon = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id
    };

    const sermon = await Sermon.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!sermon) {
      return res.status(404).json({
        success: false,
        message: 'Sermon not found'
      });
    }

    // Populate creator and modifier information
    await sermon.populate('createdBy', 'firstName lastName');
    await sermon.populate('lastModifiedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Sermon updated successfully',
      data: sermon
    });

  } catch (error) {
    console.error('Update sermon error:', error);
    
    // Handle duplicate key error (slug)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A sermon with this title already exists for the same date'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating sermon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete sermon
 * @route DELETE /api/sermons/:id
 * @access Private (Admin only)
 */
const deleteSermon = async (req, res) => {
  try {
    const { id } = req.params;

    const sermon = await Sermon.findByIdAndDelete(id);

    if (!sermon) {
      return res.status(404).json({
        success: false,
        message: 'Sermon not found'
      });
    }

    res.json({
      success: true,
      message: 'Sermon deleted successfully'
    });

  } catch (error) {
    console.error('Delete sermon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting sermon',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get featured sermons
 * @route GET /api/sermons/featured
 * @access Public
 */
const getFeaturedSermons = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const sermons = await Sermon.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: sermons
    });

  } catch (error) {
    console.error('Get featured sermons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured sermons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get sermons by series
 * @route GET /api/sermons/series/:seriesName
 * @access Public
 */
const getSermonsBySeries = async (req, res) => {
  try {
    const { seriesName } = req.params;

    const sermons = await Sermon.findBySeries(seriesName);

    res.json({
      success: true,
      data: sermons
    });

  } catch (error) {
    console.error('Get sermons by series error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching series sermons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get sermon series list
 * @route GET /api/sermons/series
 * @access Public
 */
const getSermonSeries = async (req, res) => {
  try {
    const series = await Sermon.aggregate([
      {
        $match: { 
          status: 'published',
          'series.name': { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$series.name',
          totalParts: { $max: '$series.totalParts' },
          sermonCount: { $sum: 1 },
          latestSermon: { $max: '$serviceDate' },
          firstSermon: { $min: '$serviceDate' }
        }
      },
      {
        $project: {
          name: '$_id',
          totalParts: 1,
          sermonCount: 1,
          latestSermon: 1,
          firstSermon: 1,
          _id: 0
        }
      },
      {
        $sort: { latestSermon: -1 }
      }
    ]);

    res.json({
      success: true,
      data: series
    });

  } catch (error) {
    console.error('Get sermon series error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sermon series',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Download sermon media
 * @route GET /api/sermons/:id/download/:mediaType
 * @access Public
 */
const downloadSermonMedia = async (req, res) => {
  try {
    const { id, mediaType } = req.params;

    const sermon = await Sermon.findById(id);

    if (!sermon || sermon.status !== 'published') {
      return res.status(404).json({
        success: false,
      });
    }

    let mediaUrl;
    switch (mediaType) {
      case 'audio':
        mediaUrl = sermon.media?.audio?.url;
        break;
      case 'video':
        mediaUrl = sermon.media?.video?.url;
        break;
      case 'transcript':
        mediaUrl = sermon.media?.transcript?.url;
        break;
      case 'slides':
        mediaUrl = sermon.media?.slides?.url;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid media type'
        });
    }

    if (!mediaUrl) {
      return res.status(404).json({
        success: false,
        message: `${mediaType} not available for this sermon`
      });
    }

    // Increment download count
    await sermon.incrementDownloads();

    // Redirect to media URL or return download info
    res.json({
      success: true,
      message: 'Download initiated',
      downloadUrl: mediaUrl
    });

  } catch (error) {
    console.error('Download sermon media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while initiating download',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Like/Unlike sermon
 * @route POST /api/sermons/:id/like
 * @access Private (Member)
 */
const toggleSermonLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'like' } = req.body; // 'like' or 'unlike'

    const sermon = await Sermon.findById(id);

    if (!sermon || sermon.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Sermon not found'
      });
    }

    const increment = action === 'like';
    await sermon.toggleLike(increment);

    res.json({
      success: true,
      message: `Sermon ${action}d successfully`,
      likes: sermon.analytics.likes
    });

  } catch (error) {
    console.error('Toggle sermon like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating like',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllSermons,
  getSermon,
  createSermon,
  updateSermon,
  deleteSermon,
  getFeaturedSermons,
  getSermonsBySeries,
  getSermonSeries,
  downloadSermonMedia,
  toggleSermonLike,
  getTelegramSermons
};