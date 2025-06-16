const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * File Upload Utility for Haven Word Church
 * Handles file uploads with validation, storage, and cleanup
 * Optimized for Nigerian internet conditions and church needs
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

// File size limits (optimized for Nigerian internet speeds)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024,    // 5MB for images
  audio: 50 * 1024 * 1024,   // 50MB for sermon audio
  video: 100 * 1024 * 1024,  // 100MB for sermon videos
  document: 10 * 1024 * 1024 // 10MB for documents
};

// Allowed file types
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a'],
  video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Upload directories
const UPLOAD_DIRS = {
  sermons: 'uploads/sermons',
  events: 'uploads/events',
  blogs: 'uploads/blogs',
  ministries: 'uploads/ministries',
  profiles: 'uploads/profiles',
  temp: 'uploads/temp'
};

/**
 * Ensure upload directories exist
 * Creates directory structure if it doesn't exist
 */
const ensureDirectories = async () => {
  try {
    for (const dir of Object.values(UPLOAD_DIRS)) {
      await fs.mkdir(dir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating upload directories:', error);
    throw new Error('Failed to initialize upload directories');
  }
};

/**
 * Generate unique filename with timestamp
 * Prevents filename collisions and maintains organization
 * 
 * @param {string} originalName - Original filename
 * @param {string} prefix - File prefix (sermon, event, etc.)
 * @returns {string} Unique filename
 */
const generateFileName = (originalName, prefix = 'file') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 20);
  
  return `${prefix}_${baseName}_${timestamp}_${random}${ext}`;
};

/**
 * Determine file category from MIME type
 * 
 * @param {string} mimetype - File MIME type
 * @returns {string|null} File category or null if not allowed
 */
const getFileCategory = (mimetype) => {
  for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
    if (types.includes(mimetype)) {
      return category;
    }
  }
  return null;
};

/**
 * File filter for multer
 * Validates file types and provides helpful error messages
 * 
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  const category = getFileCategory(file.mimetype);
  
  if (!category) {
    const allowedTypes = Object.values(ALLOWED_TYPES).flat().join(', ');
    return cb(new Error(`File type not allowed. Allowed types: ${allowedTypes}`), false);
  }
  
  // Store category in file object for later use
  file.category = category;
  cb(null, true);
};

/**
 * Dynamic storage configuration
 * Determines storage path based on upload type
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on route or query parameter
    let uploadType = 'temp';
    
    if (req.body.uploadType && UPLOAD_DIRS[req.body.uploadType]) {
      uploadType = req.body.uploadType;
    } else if (req.route && req.route.path) {
      // Auto-detect from route path
      if (req.route.path.includes('sermon')) uploadType = 'sermons';
      else if (req.route.path.includes('event')) uploadType = 'events';
      else if (req.route.path.includes('blog')) uploadType = 'blogs';
      else if (req.route.path.includes('ministry')) uploadType = 'ministries';
      else if (req.route.path.includes('profile')) uploadType = 'profiles';
    }
    
    const uploadPath = UPLOAD_DIRS[uploadType];
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    const prefix = req.body.filePrefix || 'hwc';
    const fileName = generateFileName(file.originalname, prefix);
    cb(null, fileName);
  }
});

/**
 * Create multer upload middleware
 * Configured for different upload scenarios
 * 
 * @param {Object} options - Upload options
 * @returns {Object} Multer upload middleware
 */
const createUploadMiddleware = (options = {}) => {
  const {
    maxFiles = 5,
    fileTypes = null,
    maxSize = null
  } = options;
  
  return multer({
    storage,
    fileFilter: fileTypes ? (req, file, cb) => {
      if (fileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Only ${fileTypes.join(', ')} files are allowed`), false);
      }
    } : fileFilter,
    limits: {
      fileSize: maxSize || Math.max(...Object.values(FILE_SIZE_LIMITS)),
      files: maxFiles
    }
  });
};

/**
 * Common upload configurations
 */
const uploadConfigs = {
  // Single image upload (profile pictures, blog images)
  singleImage: createUploadMiddleware({
    maxFiles: 1,
    fileTypes: ALLOWED_TYPES.image,
    maxSize: FILE_SIZE_LIMITS.image
  }),
  
  // Multiple images (event galleries, ministry photos)
  multipleImages: createUploadMiddleware({
    maxFiles: 10,
    fileTypes: ALLOWED_TYPES.image,
    maxSize: FILE_SIZE_LIMITS.image
  }),
  
  // Sermon audio files
  sermonAudio: createUploadMiddleware({
    maxFiles: 1,
    fileTypes: ALLOWED_TYPES.audio,
    maxSize: FILE_SIZE_LIMITS.audio
  }),
  
  // Sermon video files
  sermonVideo: createUploadMiddleware({
    maxFiles: 1,
    fileTypes: ALLOWED_TYPES.video,
    maxSize: FILE_SIZE_LIMITS.video
  }),
  
  // Document uploads (bulletins, resources)
  documents: createUploadMiddleware({
    maxFiles: 5,
    fileTypes: ALLOWED_TYPES.document,
    maxSize: FILE_SIZE_LIMITS.document
  }),
  
  // General mixed uploads
  mixed: createUploadMiddleware()
};

/**
 * Delete file from filesystem
 * Safely removes files with error handling
 * 
 * @param {string} filePath - Path to file to delete
 * @returns {Promise<boolean>} Success status
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

/**
 * Clean up old temporary files
 * Removes files older than specified time
 * 
 * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
 */
const cleanupTempFiles = async (maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const tempDir = UPLOAD_DIRS.temp;
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await deleteFile(filePath);
        console.log(`Cleaned up old temp file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

/**
 * Get file information
 * Returns detailed file metadata
 * 
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>} File information
 */
const getFileInfo = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath);
    
    return {
      name: basename,
      size: stats.size,
      extension: ext,
      mimetype: getMimeType(ext),
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      path: filePath
    };
  } catch (error) {
    throw new Error(`Unable to get file info: ${error.message}`);
  }
};

/**
 * Get MIME type from file extension
 * 
 * @param {string} ext - File extension
 * @returns {string} MIME type
 */
const getMimeType = (ext) => {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/m4a',
    '.mp4': 'video/mp4',
    '.avi': 'video/avi',
    '.mov': 'video/mov',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Validate file upload
 * Additional validation after multer processing
 * 
 * @param {Object} file - Uploaded file object
 * @returns {Object} Validation result
 */
const validateFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  const category = getFileCategory(file.mimetype);
  if (!category) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }
  
  if (file.size > FILE_SIZE_LIMITS[category]) {
    errors.push(`File size exceeds limit of ${FILE_SIZE_LIMITS[category] / (1024 * 1024)}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    category
  };
};

/**
 * Process uploaded file
 * Post-upload processing and validation
 * 
 * @param {Object} file - Multer file object
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processed file data
 */
const processFile = async (file, options = {}) => {
  try {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      // Clean up invalid file
      await deleteFile(file.path);
      throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
    }
    
    const fileInfo = await getFileInfo(file.path);
    
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      category: validation.category,
      uploadedAt: new Date(),
      ...fileInfo
    };
  } catch (error) {
    // Clean up file on error
    if (file && file.path) {
      await deleteFile(file.path);
    }
    throw error;
  }
};

// Initialize directories on module load
ensureDirectories().catch(console.error);

// Schedule cleanup of temp files every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

module.exports = {
  uploadConfigs,
  createUploadMiddleware,
  deleteFile,
  cleanupTempFiles,
  getFileInfo,
  validateFile,
  processFile,
  generateFileName,
  FILE_SIZE_LIMITS,
  ALLOWED_TYPES,
  UPLOAD_DIRS
};