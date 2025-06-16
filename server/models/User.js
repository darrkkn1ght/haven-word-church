const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * User Schema for Haven Word Church
 * Handles both public users and church members with role-based access
 */
const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [
      /^(\+234|0)[789][01]\d{8}$/,
      'Please enter a valid Nigerian phone number (e.g., +2348012345678 or 08012345678)'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },

  // Profile Information
  avatar: {
    public_id: String,
    url: String
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  address: {
    street: String,
    city: String,
    state: {
      type: String,
      enum: [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
        'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
        'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
        'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
        'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
        'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
      ]
    },
    country: {
      type: String,
      default: 'Nigeria'
    }
  },

  // Church-specific Information
  membershipStatus: {
    type: String,
    enum: ['visitor', 'new-convert', 'member', 'worker', 'leader'],
    default: 'visitor'
  },
  membershipDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value <= new Date();
      },
      message: 'Membership date cannot be in the future'
    }
  },
  department: {
    type: String,
    enum: [
      'children', 'youth', 'young-adult', 'adult', 'seniors',
      'choir', 'ushering', 'technical', 'security', 'hospitality',
      'evangelism', 'counseling', 'prayer', 'media', 'administration'
    ]
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },

  // System Information
  role: {
    type: String,
    enum: ['user', 'member', 'worker', 'admin', 'super-admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },

  // Security & Recovery
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Preferences
  preferences: {
    emailNotifications: {
      events: { type: Boolean, default: true },
      sermons: { type: Boolean, default: true },
      blogs: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true }
    },
    smsNotifications: {
      events: { type: Boolean, default: false },
      reminders: { type: Boolean, default: false }
    },
    language: {
      type: String,
      enum: ['en', 'yo', 'ig', 'ha'], // English, Yoruba, Igbo, Hausa
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Africa/Lagos'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ membershipStatus: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual fields
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

userSchema.virtual('isAccountLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  try {
    // Hash password if it's modified
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastLogin on login
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    // Reset login attempts on successful login
    this.loginAttempts = 0;
    this.lockUntil = undefined;
  }
  next();
});

// Instance methods
/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Increment login attempts and lock account if necessary
 * @returns {Promise<void>}
 */
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1
      },
      $unset: {
        lockUntil: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we're at max attempts and not locked, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

/**
 * Generate email verification token
 * @returns {string} - Verification token
 */
userSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

/**
 * Generate password reset token
 * @returns {string} - Reset token
 */
userSchema.methods.getPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

/**
 * Check if user has permission for a specific action
 * @param {string} action - Action to check permission for
 * @returns {boolean} - True if user has permission
 */
userSchema.methods.hasPermission = function(action) {
  const permissions = {
    'user': ['view-public-content'],
    'member': ['view-public-content', 'view-member-content', 'manage-profile'],
    'worker': ['view-public-content', 'view-member-content', 'manage-profile', 'manage-events'],
    'admin': ['view-public-content', 'view-member-content', 'manage-profile', 'manage-events', 'manage-users', 'manage-content'],
    'super-admin': ['*'] // All permissions
  };
  
  const userPermissions = permissions[this.role] || [];
  return userPermissions.includes('*') || userPermissions.includes(action);
};

// Static methods
/**
 * Find user by email verification token
 * @param {string} token - Verification token
 * @returns {Promise<User|null>} - User object or null
 */
userSchema.statics.findByVerificationToken = function(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });
};

/**
 * Find user by password reset token
 * @param {string} token - Reset token
 * @returns {Promise<User|null>} - User object or null
 */
userSchema.statics.findByPasswordResetToken = function(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() }
  });
};

/**
 * Get user statistics
 * @returns {Promise<Object>} - User statistics
 */
userSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$membershipStatus',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        breakdown: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);