// Custom error class
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔥 Error Details:', {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } else {
    // Log only essential error info in production
    console.error('❌ Error:', {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again';
    error = new ErrorResponse(message, 401);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large. Maximum size is 5MB';
    error = new ErrorResponse(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Too many files uploaded';
    error = new ErrorResponse(message, 400);
  }

  // Rate limiting error
  if (err.statusCode === 429) {
    const message = 'Too many requests. Please try again later';
    error = new ErrorResponse(message, 429);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  // Send error response
  if (typeof res.status === 'function') {
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  } else {
    // Fallback: log error if res is not a real Express response object
    console.error('Error handler called with invalid res object:', res);
    console.error('Error:', err);
  }
};

// Async handler wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  ErrorResponse,
  errorHandler,
  asyncHandler,
  notFound
};