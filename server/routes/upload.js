const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/uploadFile');
const sharp = require('sharp');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/temp'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg'],
      video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi']
    };

    const fileType = req.body.type || 'image'; // Default to image
    if (allowedTypes[fileType] && allowedTypes[fileType].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types for ${fileType}: ${allowedTypes[fileType].join(', ')}`));
    }
  }
});

// Upload image
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'blog-images');
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// Upload audio
router.post('/audio', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'sermon-audio');
    
    res.json({
      success: true,
      message: 'Audio uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading audio',
      error: error.message
    });
  }
});

// Upload video
router.post('/video', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'sermon-video');
    
    res.json({
      success: true,
      message: 'Video uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message
    });
  }
});

// Upload document (PDF, etc.)
router.post('/document', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'documents');
    
    res.json({
      success: true,
      message: 'Document uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
});

// Delete uploaded file
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

// Placeholder image endpoint
router.get('/placeholder/:w/:h', async (req, res) => {
  const width = parseInt(req.params.w) || 600;
  const height = parseInt(req.params.h) || 400;
  try {
    const image = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 220, g: 220, b: 220 }
      }
    })
      .png()
      .toBuffer();
    res.set('Content-Type', 'image/png');
    res.send(image);
  } catch (err) {
    res.status(500).send('Error generating placeholder image');
  }
});

module.exports = router; 