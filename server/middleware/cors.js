/**
 * CORS Middleware Configuration
 * Haven Word Church - Cross-Origin Resource Sharing Setup
 * 
 * Handles CORS policy for secure cross-origin requests between
 * frontend and backend, with environment-specific configurations
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

const cors = require('cors');

/**
 * CORS configuration options based on environment
 * @type {Object}
 */
const corsOptions = {
  // Allow credentials (cookies, authorization headers, etc.)
  credentials: true,
  
  // Dynamic origin configuration based on environment
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Define allowed origins based on environment
    const allowedOrigins = getAllowedOrigins();
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS: Blocked request from origin: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} is not allowed`), false);
    }
  },
  
  // Allowed HTTP methods
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],
  
  // Allowed headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token',
    'X-Key',
    'X-Church-Client'
  ],
  
  // Headers exposed to the client
  exposedHeaders: [
    'Authorization',
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page'
  ],
  
  // Preflight cache duration (24 hours)
  maxAge: 86400,
  
  // Handle preflight for complex requests
  preflightContinue: false,
  
  // Provide successful OPTIONS status
  optionsSuccessStatus: 200
};

/**
 * Get allowed origins based on environment
 * @returns {Array<string>} Array of allowed origins
 */
function getAllowedOrigins() {
  const environment = process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'production':
      return [
        process.env.FRONTEND_URL || 'https://havenwordchurch.com',
        process.env.ADMIN_URL || 'https://admin.havenwordchurch.com',
        'https://havenwordchurch.netlify.app',
        'https://havenwordchurch.vercel.app'
      ].filter(Boolean); // Remove undefined values
      
    case 'staging':
      return [
        process.env.FRONTEND_URL || 'https://staging.havenwordchurch.com',
        process.env.ADMIN_URL || 'https://admin-staging.havenwordchurch.com',
        'https://staging-havenwordchurch.netlify.app',
        'https://staging-havenwordchurch.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
      ].filter(Boolean);
      
    case 'development':
    default:
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        // Local network access for mobile testing
        'http://192.168.1.1:3000',
        'http://192.168.0.1:3000',
        // Add your local IP for mobile testing
        process.env.LOCAL_IP ? `http://${process.env.LOCAL_IP}:3000` : null
      ].filter(Boolean);
  }
}

/**
 * Enhanced CORS middleware with logging
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const corsMiddleware = (req, res, next) => {
  // Log CORS requests in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 CORS: ${req.method} request from origin: ${req.get('Origin') || 'No origin'}`);
  }
  
  // Apply CORS with options
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      console.error('❌ CORS Error:', err.message);
      return res.status(403).json({
        success: false,
        message: 'CORS policy violation',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Access denied'
      });
    }
    next();
  });
};

/**
 * Preflight handler for complex CORS requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handlePreflight = (req, res) => {
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('✈️ CORS: Handling preflight request');
    res.status(200).end();
    return;
  }
};

/**
 * CORS configuration for specific routes
 * @param {Array<string>} allowedOrigins - Custom allowed origins
 * @returns {Function} CORS middleware with custom origins
 */
const createCustomCors = (allowedOrigins = []) => {
  const customOptions = {
    ...corsOptions,
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const allAllowed = [...getAllowedOrigins(), ...allowedOrigins];
      
      if (allAllowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Custom CORS: Origin ${origin} is not allowed`), false);
      }
    }
  };
  
  return cors(customOptions);
};

/**
 * Strict CORS for admin routes
 * Only allows admin-specific origins
 */
const adminCors = cors({
  ...corsOptions,
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const adminOrigins = [
      process.env.ADMIN_URL,
      'https://admin.havenwordchurch.com',
      'https://admin-staging.havenwordchurch.com',
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3001'] : [])
    ].filter(Boolean);
    
    if (adminOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🔒 Admin CORS: Blocked unauthorized admin access from: ${origin}`);
      callback(new Error('Admin access denied'), false);
    }
  }
});

/**
 * Public API CORS - More permissive for public endpoints
 */
const publicCors = cors({
  ...corsOptions,
  credentials: false, // No credentials for public API
  origin: true, // Allow all origins for public endpoints
  methods: ['GET', 'POST', 'OPTIONS']
});

module.exports = {
  corsMiddleware,
  handlePreflight,
  createCustomCors,
  adminCors,
  publicCors,
  corsOptions,
  getAllowedOrigins
};