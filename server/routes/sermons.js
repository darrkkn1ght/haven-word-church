const express = require('express');
const { body } = require('express-validator');
// const auth = require('../middleware/auth');
const {
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
} = require('../controllers/sermonController');

const router = express.Router();

/**
 * Sermon Routes for Haven Word Church
 * Handles all sermon-related API endpoints with proper validation and authorization
 * 
 * Public Routes:
 * - GET /api/sermons - Get all published sermons
 * - GET /api/sermons/featured - Get featured sermons
 * - GET /api/sermons/series - Get sermon series list
 * - GET /api/sermons/series/:seriesName - Get sermons by series
 * - GET /api/sermons/:identifier - Get single sermon
 * - GET /api/sermons/:id/download/:mediaType - Download sermon media
 * 
 * Protected Routes (Member):
 * - POST /api/sermons/:id/like - Like/unlike sermon
 * 
 * Admin Routes:
 * - POST /api/sermons - Create sermon
 * - PUT /api/sermons/:id - Update sermon
 * - DELETE /api/sermons/:id - Delete sermon
 */

// Validation rules for creating/updating sermons
const sermonValidationRules = [
  body('title')
    .notEmpty()
    .withMessage('Sermon title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim(),
  
  body('description')
    .notEmpty()
    .withMessage('Sermon description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  
  body('scriptureReference')
    .notEmpty()
    .withMessage('Scripture reference is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Scripture reference must be between 3 and 200 characters')
    .trim(),
  
  body('keyVerse')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Key verse cannot exceed 500 characters')
    .trim(),
  
  body('series.name')
    .optional()
    .isLength({ max: 150 })
    .withMessage('Series name cannot exceed 150 characters')
    .trim(),
  
  body('series.part')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Series part must be a positive integer'),
  
  body('series.totalParts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total parts must be a positive integer')
    .custom((value, { req }) => {
      if (req.body.series?.part && value < req.body.series.part) {
        throw new Error('Total parts cannot be less than current part');
      }
      return true;
    }),
  
  body('speaker.name')
    .notEmpty()
    .withMessage('Speaker name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Speaker name must be between 2 and 100 characters')
    .trim(),
  
  body('speaker.title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Speaker title cannot exceed 100 characters')
    .trim(),
  
  body('speaker.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Speaker bio cannot exceed 500 characters')
    .trim(),
  
  body('speaker.isGuestSpeaker')
    .optional()
    .isBoolean()
    .withMessage('Guest speaker must be a boolean'),
  
  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn([
      'Sunday Service', 
      'Midweek Service', 
      'Prayer Meeting', 
      'Youth Service', 
      'Women Fellowship', 
      'Men Fellowship', 
      'Special Service', 
      'Conference', 
      'Retreat'
    ])
    .withMessage('Invalid service type'),
  
  body('serviceDate')
    .notEmpty()
    .withMessage('Service date is required')
    .isISO8601()
    .withMessage('Service date must be a valid date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Service date cannot be in the future');
      }
      return true;
    }),
  
  body('category')
    .notEmpty()
    .withMessage('Sermon category is required')
    .isIn([
      'Teaching', 
      'Evangelistic', 
      'Prophetic', 
      'Pastoral', 
      'Worship', 
      'Prayer', 
      'Testimony', 
      'Special Occasion'
    ])
    .withMessage('Invalid sermon category'),
  
  // Media validation
  body('media.audio.url')
    .optional()
    .isURL()
    .withMessage('Audio URL must be valid'),
  
  body('media.audio.duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Audio duration must be a positive integer'),
  
  body('media.audio.fileSize')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Audio file size must be a positive integer'),
  
  body('media.audio.format')
    .optional()
    .isIn(['mp3', 'wav', 'm4a'])
    .withMessage('Invalid audio format'),
  
  body('media.video.url')
    .optional()
    .isURL()
    .withMessage('Video URL must be valid'),
  
  body('media.video.thumbnailUrl')
    .optional()
    .isURL()
    .withMessage('Video thumbnail URL must be valid'),
  
  body('media.video.duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Video duration must be a positive integer'),
  
  body('media.video.fileSize')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Video file size must be a positive integer'),
  
  body('media.video.format')
    .optional()
    .isIn(['mp4', 'webm', 'avi'])
    .withMessage('Invalid video format'),
  
  body('media.video.quality')
    .optional()
    .isIn(['360p', '480p', '720p', '1080p'])
    .withMessage('Invalid video quality'),
  
  body('media.transcript.url')
    .optional()
    .isURL()
    .withMessage('Transcript URL must be valid'),
  
  body('media.transcript.format')
    .optional()
    .isIn(['pdf', 'doc', 'docx', 'txt'])
    .withMessage('Invalid transcript format'),
  
  body('media.slides.url')
    .optional()
    .isURL()
    .withMessage('Slides URL must be valid'),
  
  body('media.slides.format')
    .optional()
    .isIn(['pdf', 'ppt', 'pptx'])
    .withMessage('Invalid slides format'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 20) {
        throw new Error('Cannot have more than 20 tags');
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
    .isIn(['draft', 'published', 'archived', 'private'])
    .withMessage('Invalid status'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('featuredImageUrl')
    .optional()
    .isURL()
    .withMessage('Featured image URL must be valid'),
  
  body('metaDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters')
    .trim()
];

// Validation for like/unlike action
const likeValidationRules = [
  body('action')
    .optional()
    .isIn(['like', 'unlike'])
    .withMessage('Action must be either "like" or "unlike"')
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
// Get all sermons (with filtering and pagination)
router.get('/', getAllSermons);

// Get featured sermons
router.get('/featured', getFeaturedSermons);

// Get sermon series list
router.get('/series', getSermonSeries);

// Get sermons by series
router.get('/series/:seriesName', getSermonsBySeries);

// Download sermon media
router.get('/:id/download/:mediaType', downloadSermonMedia);

// Add Telegram sermons endpoint BEFORE the dynamic identifier route
router.get('/telegram', getTelegramSermons);

// Get single sermon by ID or slug
router.get('/:identifier', getSermon);

// Protected Member Routes
// Like/unlike sermon
router.post('/:id/like', likeValidationRules, toggleSermonLike);

// Admin/Staff Routes
// Create new sermon
router.post('/', sermonValidationRules, createSermon);

// Update existing sermon
router.put('/:id', sermonValidationRules, updateSermon);

// Admin Only Routes
// Delete sermon
router.delete('/:id', deleteSermon);

module.exports = router;