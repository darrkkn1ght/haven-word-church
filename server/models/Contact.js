const mongoose = require('mongoose');

/**
 * Contact Schema for Haven Word Church
 * Handles contact forms, prayer requests, and general inquiries
 * 
 * @description Manages all contact submissions from website visitors and members
 * @author Haven Word Church Development Team
 * @version 1.0.0
 */

const contactSchema = new mongoose.Schema({
  // Personal Information
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
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  
  phone: {
    type: String,
    trim: true,
    match: [
      /^(\+234|0)[7-9][0-1]\d{8}$/,
      'Please provide a valid Nigerian phone number'
    ]
  },
  
  // Contact Details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Contact Type & Category
  contactType: {
    type: String,
    required: true,
    enum: {
      values: [
        'general_inquiry',
        'prayer_request',
        'ministry_inquiry',
        'event_inquiry',
        'pastoral_care',
        'volunteer_interest',
        'partnership',
        'media_inquiry',
        'technical_support',
        'feedback',
        'other'
      ],
      message: 'Please select a valid contact type'
    },
    default: 'general_inquiry'
  },
  
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'high', 'urgent'],
      message: 'Priority must be low, normal, high, or urgent'
    },
    default: 'normal'
  },
  
  // Status & Response Tracking
  status: {
    type: String,
    enum: {
      values: ['new', 'read', 'in_progress', 'responded', 'resolved', 'closed'],
      message: 'Status must be new, read, in_progress, responded, resolved, or closed'
    },
    default: 'new'
  },
  
  // Assignment & Response
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  responseMessage: {
    type: String,
    trim: true,
    maxlength: [2000, 'Response message cannot exceed 2000 characters']
  },
  
  responseDate: {
    type: Date,
    default: null
  },
  
  // Privacy & Consent
  isPrivate: {
    type: Boolean,
    default: false,
    comment: 'Mark as private for sensitive prayer requests or pastoral care'
  },
  
  allowPublicPrayer: {
    type: Boolean,
    default: false,
    comment: 'Allow prayer request to be shared publicly (with anonymization)'
  },
  
  consentToContact: {
    type: Boolean,
    required: true,
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'Consent to contact is required'
    }
  },
  
  // Nigerian Context
  location: {
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    lga: {
      type: String,
      trim: true,
      maxlength: [100, 'Local Government Area cannot exceed 100 characters'],
      comment: 'Local Government Area for Nigerian context'
    }
  },
  
  preferredLanguage: {
    type: String,
    enum: ['english', 'yoruba', 'igbo', 'hausa', 'pidgin'],
    default: 'english'
  },
  
  // Technical & Metadata
  ipAddress: {
    type: String,
    trim: true
  },
  
  userAgent: {
    type: String,
    trim: true
  },
  
  referralSource: {
    type: String,
    enum: [
      'website',
      'social_media',
      'word_of_mouth',
      'google_search',
      'church_member',
      'event',
      'ministry',
      'other'
    ],
    default: 'website'
  },
  
  // Internal Notes (Staff Only)
  internalNotes: [{
    note: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Internal note cannot exceed 500 characters']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Follow-up tracking
  followUpRequired: {
    type: Boolean,
    default: false
  },
  
  followUpDate: {
    type: Date,
    default: null
  },
  
  followUpCompleted: {
    type: Boolean,
    default: false
  },
  
  // Tags for organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ contactType: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ priority: 1, status: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for response time (in hours)
contactSchema.virtual('responseTime').get(function() {
  if (!this.responseDate) return null;
  
  const diffInMs = this.responseDate - this.createdAt;
  return Math.round(diffInMs / (1000 * 60 * 60)); // Convert to hours
});

// Virtual for contact age (in days)
contactSchema.virtual('contactAge').get(function() {
  const diffInMs = Date.now() - this.createdAt;
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Convert to days
});

// Virtual for urgency level (computed based on priority and age)
contactSchema.virtual('urgencyLevel').get(function() {
  const age = this.contactAge;
  const priority = this.priority;
  
  if (priority === 'urgent') return 'critical';
  if (priority === 'high' && age > 1) return 'high';
  if (priority === 'normal' && age > 3) return 'medium';
  if (age > 7) return 'overdue';
  
  return 'normal';
});

/**
 * Pre-save middleware to handle automatic assignments and validations
 */
contactSchema.pre('save', function(next) {
  // Auto-assign priority based on contact type
  if (this.isNew) {
    if (this.contactType === 'pastoral_care') {
      this.priority = 'high';
    } else if (this.contactType === 'prayer_request') {
      this.priority = 'normal';
    }
  }
  
  // Set response date when status changes to responded
  if (this.isModified('status') && this.status === 'responded' && !this.responseDate) {
    this.responseDate = new Date();
  }
  
  // Clear response date if status goes back to earlier stage
  if (this.isModified('status') && ['new', 'read', 'in_progress'].includes(this.status)) {
    this.responseDate = null;
    this.responseMessage = '';
    this.respondedBy = null;
  }
  
  next();
});

/**
 * Static method to get contact statistics
 * @returns {Promise<Object>} Contact statistics
 */
contactSchema.statics.getContactStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        responded: { $sum: { $cond: [{ $eq: ['$status', 'responded'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0, new: 0, inProgress: 0, responded: 0, resolved: 0, urgent: 0, high: 0
  };
};

/**
 * Static method to get contacts by type
 * @param {string} contactType - Type of contact to filter by
 * @returns {Promise<Array>} Filtered contacts
 */
contactSchema.statics.getByType = function(contactType) {
  return this.find({ contactType })
    .sort({ createdAt: -1 })
    .populate('assignedTo', 'firstName lastName email')
    .populate('respondedBy', 'firstName lastName email');
};

/**
 * Static method to get overdue contacts
 * @param {number} days - Number of days to consider overdue (default: 3)
 * @returns {Promise<Array>} Overdue contacts
 */
contactSchema.statics.getOverdueContacts = function(days = 3) {
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - days);
  
  return this.find({
    createdAt: { $lt: overdueDate },
    status: { $in: ['new', 'read', 'in_progress'] }
  })
  .sort({ createdAt: 1 })
  .populate('assignedTo', 'firstName lastName email');
};

/**
 * Instance method to add internal note
 * @param {string} noteText - Note content
 * @param {ObjectId} userId - ID of user adding the note
 */
contactSchema.methods.addInternalNote = function(noteText, userId) {
  this.internalNotes.push({
    note: noteText,
    addedBy: userId,
    addedAt: new Date()
  });
  return this.save();
};

/**
 * Instance method to assign contact to staff member
 * @param {ObjectId} userId - ID of staff member to assign to
 */
contactSchema.methods.assignTo = function(userId) {
  this.assignedTo = userId;
  if (this.status === 'new') {
    this.status = 'read';
  }
  return this.save();
};

module.exports = mongoose.model('Contact', contactSchema);