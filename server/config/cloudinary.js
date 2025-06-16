const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/**
 * Cloudinary Configuration for Haven Word Church
 * Cloud storage solution optimized for Nigerian internet conditions
 * Handles images, videos, and audio files for church content
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

/**
 * Initialize Cloudinary with environment variables
 * Ensure these are set in your .env file:
 * CLOUDINARY_CLOUD_NAME=your_cloud_name
 * CLOUDINARY_API_KEY=your_api_key
 * CLOUDINARY_API_SECRET=your_api_secret
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Always use HTTPS
});

/**
 * Cloudinary folder structure for organized storage
 */
const CLOUD_FOLDERS = {
  sermons: {
    audio: 'haven-word-church/sermons/audio',
    video: 'haven-word-church/sermons/video',
    thumbnails: 'haven-word-church/sermons/thumbnails'
  },
  events: {
    images: 'haven-word-church/events/images',
    banners: 'haven-word-church/events/banners'
  },
  blogs: {
    images: 'haven-word-church/blogs/images',
    featured: 'haven-word-church/blogs/featured'
  },
  ministries: {
    images: 'haven-word-church/ministries/images',
    banners: 'haven-word-church/ministries/banners'
  },
  profiles: {
    avatars: 'haven-word-church/profiles/avatars',
    staff: 'haven-word-church/profiles/staff'
  },
  general: {
    documents: 'haven-word-church/documents',
    gallery: 'haven-word-church/gallery'
  }
};

/**
 * Upload presets for different content types
 * Optimized for Nigerian internet speeds and church needs
 */
const UPLOAD_PRESETS = {
  // High-quality images (staff photos, featured content)
  highQualityImage: {
    quality: 'auto:good',
    fetch_format: 'auto',
    width: 1200,
    height: 800,
    crop: 'limit',
    flags: 'progressive'
  },
  
  // Standard images (blog posts, general content)
  standardImage: {
    quality: 'auto:eco',
    fetch_format: 'auto',
    width: 800,
    height: 600,
    crop: 'limit',
    flags: 'progressive'
  },
  
  // Thumbnails (sermon previews, event cards)
  thumbnail: {
    quality: 'auto:low',
    fetch_format: 'auto',
    width: 300,
    height: 200,
    crop: 'fill',
    gravity: 'auto'
  },
  
  // Profile avatars
  avatar: {
    quality: 'auto:good',
    fetch_format: 'auto',
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    radius: 'max'
  },
  
  // Sermon audio (optimized for streaming)
  sermonAudio: {
    resource_type: 'video',
    format: 'mp3',
    bit_rate: '128k',
    audio_codec: 'mp3'
  },
  
  // Sermon video (compressed for Nigerian bandwidth)
  sermonVideo: {
    resource_type: 'video',
    quality: 'auto:low',
    width: 720,
    height: 480,
    crop: 'limit',
    bit_rate: '500k',
    video_codec: 'h264'
  }
};

/**
 * Create Cloudinary storage for multer
 * 
 * @param {string} folder - Cloudinary folder path
 * @param {Object} transformations - Image/video transformations
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {CloudinaryStorage} Configured storage instance
 */
const createCloudinaryStorage = (folder, transformations = {}, resourceType = 'image') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      resource_type: resourceType,
      public_id: (req, file) => {
        // Generate unique public ID
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const baseName = file.originalname
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars
          .substring(0, 20);
        
        return `${baseName}_${timestamp}_${random}`;
      },
      ...transformations
    }
  });
};

/**
 * Pre-configured storage instances for different use cases
 */
const storageConfigs = {
  // Sermon audio storage
  sermonAudio: createCloudinaryStorage(
    CLOUD_FOLDERS.sermons.audio,
    UPLOAD_PRESETS.sermonAudio,
    'video'
  ),
  
  // Sermon video storage
  sermonVideo: createCloudinaryStorage(
    CLOUD_FOLDERS.sermons.video,
    UPLOAD_PRESETS.sermonVideo,
    'video'
  ),
  
  // Sermon thumbnails
  sermonThumbnail: createCloudinaryStorage(
    CLOUD_FOLDERS.sermons.thumbnails,
    UPLOAD_PRESETS.thumbnail
  ),
  
  // Event images
  eventImage: createCloudinaryStorage(
    CLOUD_FOLDERS.events.images,
    UPLOAD_PRESETS.standardImage
  ),
  
  // Event banners
  eventBanner: createCloudinaryStorage(
    CLOUD_FOLDERS.events.banners,
    UPLOAD_PRESETS.highQualityImage
  ),
  
  // Blog images
  blogImage: createCloudinaryStorage(
    CLOUD_FOLDERS.blogs.images,
    UPLOAD_PRESETS.standardImage
  ),
  
  // Blog featured images
  blogFeatured: createCloudinaryStorage(
    CLOUD_FOLDERS.blogs.featured,
    UPLOAD_PRESETS.highQualityImage
  ),
  
  // Ministry images
  ministryImage: createCloudinaryStorage(
    CLOUD_FOLDERS.ministries.images,
    UPLOAD_PRESETS.standardImage
  ),
  
  // Profile avatars
  profileAvatar: createCloudinaryStorage(
    CLOUD_FOLDERS.profiles.avatars,
    UPLOAD_PRESETS.avatar
  ),
  
  // Staff photos
  staffPhoto: createCloudinaryStorage(
    CLOUD_FOLDERS.profiles.staff,
    UPLOAD_PRESETS.highQualityImage
  ),
  
  // General gallery
  gallery: createCloudinaryStorage(
    CLOUD_FOLDERS.general.gallery,
    UPLOAD_PRESETS.standardImage
  ),
  
  // Documents (bulletins, resources)
  documents: createCloudinaryStorage(
    CLOUD_FOLDERS.general.documents,
    {},
    'raw'
  )
};

/**
 * Upload file to Cloudinary
 * Direct upload without multer middleware
 * 
 * @param {string|Buffer} file - File path or buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const {
      folder = CLOUD_FOLDERS.general.gallery,
      transformation = UPLOAD_PRESETS.standardImage,
      resourceType = 'image',
      publicId = null
    } = options;
    
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      ...transformation
    };
    
    if (publicId) {
      uploadOptions.public_id = publicId;
    }
    
    const result = await cloudinary.uploader.upload(file, uploadOptions);
    
    return {
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete file from Cloudinary
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate optimized URL for different use cases
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
const getOptimizedUrl = (publicId, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    gravity = 'auto'
  } = options;
  
  const transformations = {
    quality,
    fetch_format: format,
    flags: 'progressive'
  };
  
  if (width) transformations.width = width;
  if (height) transformations.height = height;
  if (width || height) {
    transformations.crop = crop;
    transformations.gravity = gravity;
  }
  
  return cloudinary.url(publicId, transformations);
};

/**
 * Generate responsive image URLs for different screen sizes
 * Optimized for Nigerian mobile usage patterns
 * 
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} Responsive image URLs
 */
const getResponsiveUrls = (publicId) => {
  return {
    mobile: getOptimizedUrl(publicId, { width: 400, quality: 'auto:low' }),
    tablet: getOptimizedUrl(publicId, { width: 768, quality: 'auto:eco' }),
    desktop: getOptimizedUrl(publicId, { width: 1200, quality: 'auto:good' }),
    thumbnail: getOptimizedUrl(publicId, { width: 150, height: 150, crop: 'fill' })
  };
};

/**
 * Bulk delete files from Cloudinary
 * Useful for cleanup operations
 * 
 * @param {Array<string>} publicIds - Array of public IDs to delete
 * @param {string} resourceType - Resource type
 * @returns {Promise<Object>} Bulk deletion result
 */
const bulkDeleteFromCloudinary = async (publicIds, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType
    });
    
    return {
      success: true,
      deleted: result.deleted,
      deletedCount: Object.keys(result.deleted).length,
      partial: result.partial,
      rateLimitAllowed: result.rate_limit_allowed,
      rateLimitReset: result.rate_limit_reset_at
    };
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get folder contents from Cloudinary
 * 
 * @param {string} folder - Folder path
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Folder contents
 */
const getFolderContents = async (folder, options = {}) => {
  try {
    const {
      maxResults = 50,
      resourceType = 'image'
    } = options;
    
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .max_results(maxResults)
      .execute();
    
    return {
      success: true,
      resources: result.resources,
      totalCount: result.total_count,
      nextCursor: result.next_cursor
    };
  } catch (error) {
    console.error('Cloudinary folder search error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Health check for Cloudinary connection
 * 
 * @returns {Promise<Object>} Health status
 */
const healthCheck = async () => {
  try {
    // Test upload a small image
    const testResult = await cloudinary.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      {
        folder: 'test',
        public_id: 'health_check'
      }
    );
    
    // Clean up test file
    await cloudinary.uploader.destroy(testResult.public_id);
    
    return {
      status: 'healthy',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  cloudinary,
  storageConfigs,
  CLOUD_FOLDERS,
  UPLOAD_PRESETS,
  createCloudinaryStorage,
  uploadToCloudinary,
  deleteFromCloudinary,
  bulkDeleteFromCloudinary,
  getOptimizedUrl,
  getResponsiveUrls,
  getFolderContents,
  healthCheck
};