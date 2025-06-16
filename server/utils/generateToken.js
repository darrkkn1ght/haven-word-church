const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user authentication
 * @param {string} userId - The user's MongoDB ObjectId
 * @param {string} role - The user's role (member, admin, pastor, etc.)
 * @param {string} email - The user's email address
 * @param {Object} options - Additional token options
 * @param {string} options.expiresIn - Token expiration time (default: '30d')
 * @param {string} options.issuer - Token issuer (default: 'Haven Word Church')
 * @returns {string} JWT token
 * @throws {Error} If token generation fails
 */
const generateToken = (userId, role, email, options = {}) => {
  try {
    // Validate required parameters
    if (!userId) {
      throw new Error('User ID is required for token generation');
    }
    
    if (!role) {
      throw new Error('User role is required for token generation');
    }
    
    if (!email) {
      throw new Error('User email is required for token generation');
    }

    // Default options
    const defaultOptions = {
      expiresIn: '30d',
      issuer: 'Haven Word Church'
    };

    // Merge with provided options
    const tokenOptions = { ...defaultOptions, ...options };

    // Token payload
    const payload = {
      userId,
      role,
      email,
      iss: tokenOptions.issuer,
      iat: Math.floor(Date.now() / 1000), // Issued at time
      // Add Nigerian timezone context
      timezone: 'Africa/Lagos'
    };

    // Generate token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: tokenOptions.expiresIn,
        issuer: tokenOptions.issuer
      }
    );

    return token;

  } catch (error) {
    console.error('Token generation failed:', error.message);
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Generate refresh token for extended authentication
 * @param {string} userId - The user's MongoDB ObjectId
 * @param {string} email - The user's email address
 * @returns {string} Refresh JWT token
 * @throws {Error} If refresh token generation fails
 */
const generateRefreshToken = (userId, email) => {
  try {
    // Validate required parameters
    if (!userId) {
      throw new Error('User ID is required for refresh token generation');
    }
    
    if (!email) {
      throw new Error('User email is required for refresh token generation');
    }

    // Refresh token payload (minimal info for security)
    const payload = {
      userId,
      email,
      type: 'refresh',
      iss: 'Haven Word Church',
      iat: Math.floor(Date.now() / 1000)
    };

    // Generate refresh token (longer expiration)
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: '7d', // 7 days for refresh token
        issuer: 'Haven Word Church'
      }
    );

    return refreshToken;

  } catch (error) {
    console.error('Refresh token generation failed:', error.message);
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
};

/**
 * Generate password reset token
 * @param {string} userId - The user's MongoDB ObjectId
 * @param {string} email - The user's email address
 * @returns {string} Password reset JWT token
 * @throws {Error} If reset token generation fails
 */
const generatePasswordResetToken = (userId, email) => {
  try {
    // Validate required parameters
    if (!userId) {
      throw new Error('User ID is required for password reset token generation');
    }
    
    if (!email) {
      throw new Error('User email is required for password reset token generation');
    }

    // Password reset token payload
    const payload = {
      userId,
      email,
      type: 'password-reset',
      iss: 'Haven Word Church',
      iat: Math.floor(Date.now() / 1000)
    };

    // Generate password reset token (short expiration for security)
    const resetToken = jwt.sign(
      payload,
      process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: '1h', // 1 hour for password reset
        issuer: 'Haven Word Church'
      }
    );

    return resetToken;

  } catch (error) {
    console.error('Password reset token generation failed:', error.message);
    throw new Error(`Password reset token generation failed: ${error.message}`);
  }
};

/**
 * Generate email verification token
 * @param {string} userId - The user's MongoDB ObjectId
 * @param {string} email - The user's email address
 * @returns {string} Email verification JWT token
 * @throws {Error} If verification token generation fails
 */
const generateEmailVerificationToken = (userId, email) => {
  try {
    // Validate required parameters
    if (!userId) {
      throw new Error('User ID is required for email verification token generation');
    }
    
    if (!email) {
      throw new Error('User email is required for email verification token generation');
    }

    // Email verification token payload
    const payload = {
      userId,
      email,
      type: 'email-verification',
      iss: 'Haven Word Church',
      iat: Math.floor(Date.now() / 1000)
    };

    // Generate email verification token
    const verificationToken = jwt.sign(
      payload,
      process.env.JWT_VERIFICATION_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: '24h', // 24 hours for email verification
        issuer: 'Haven Word Church'
      }
    );

    return verificationToken;

  } catch (error) {
    console.error('Email verification token generation failed:', error.message);
    throw new Error(`Email verification token generation failed: ${error.message}`);
  }
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret (optional, defaults to JWT_SECRET)
 * @returns {Object} Decoded token payload
 * @throws {Error} If token verification fails
 */
const verifyToken = (token, secret = null) => {
  try {
    if (!token) {
      throw new Error('Token is required for verification');
    }

    const jwtSecret = secret || process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT secret is not configured');
    }

    const decoded = jwt.verify(token, jwtSecret);
    return decoded;

  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  verifyToken
};