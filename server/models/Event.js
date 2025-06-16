/**
 * Event Model for Haven Word Church
 * Handles church events, services, meetings, and programs
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');

/**
 * Event Schema Definition
 * Represents all church events including services, meetings, programs, and special events
 */
const eventSchema = new mongoose.Schema({
  // Basic Event Information
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Event title cannot exceed 100 characters']
  },

  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Event description cannot exceed 2000 characters']
  },

  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: {
      values: [
        'Service', 'Prayer Meeting', 'Bible Study', 'Youth Program',
        'Children Program', 'Men Fellowship', 'Women Fellowship',
        'Conference', 'Seminar', 'Workshop', 'Concert', 'Outreach',
        'Community Service', 'Wedding', 'Dedication', 'Memorial',
        'Fellowship', 'Retreat', 'Revival', 'Training', 'Other'
      ],
      message: 'Please select a valid event category'
    }
  },

  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: {
      values: ['Regular', 'Special', 'One-time', 'Recurring'],
      message: 'Event type must be Regular, Special, One-time, or Recurring'
    }
  },

  // Date and Time Information
  startDate: {
    type: Date,
    required: [true, 'Event start date is required']
  },

  endDate: {
    type: Date,
    required: [true, 'Event end date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },

  startTime: {
    type: String,
    required: [true, 'Event start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)']
  },

  endTime: {
    type: String,
    required: [true, 'Event end time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)']
  },

  timezone: {
    type: String,
    default: 'Africa/Lagos' // Nigerian timezone
  },

  // Recurring Event Information
  recurrence: {
    pattern: {
      type: String,
      enum: ['None', 'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'],
      default: 'None'
    },
    interval: {
      type: Number,
      default: 1,
      min: [1, 'Recurrence interval must be at least 1']
    },
    daysOfWeek: [{
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }],
    endRecurrence: {
      type: Date
    },
    occurrences: {
      type: Number,
      min: [1, 'Number of occurrences must be at least 1']
    }
  },

  // Location Information
  location: {
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
      maxlength: [200, 'Venue name cannot exceed 200 characters']
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [200, 'Street address cannot exceed 200 characters']
      },
      city: {
        type: String,
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters']
      },
      state: {
        type: String,
        trim: true,
        maxlength: [100, 'State cannot exceed 100 characters']
      },
      country: {
        type: String,
        default: 'Nigeria',
        trim: true
      },
      zipCode: {
        type: String,
        trim: true
      }
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    onlineDetails: {
      platform: {
        type: String,
        enum: ['Zoom', 'Google Meet', 'Microsoft Teams', 'YouTube Live', 'Facebook Live', 'Other']
      },
      link: {
        type: String,
        trim: true
      },
      meetingId: {
        type: String,
        trim: true
      },
      password: {
        type: String,
        trim: true
      }
    }
  },

  // Event Management
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required']
  },

  ministry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ministry'
  },

  speakers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Speaker name cannot exceed 100 characters']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Speaker title cannot exceed 100 characters']
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Speaker bio cannot exceed 500 characters']
    },
    isMainSpeaker: {
      type: Boolean,
      default: false
    }
  }],

  // Registration and Attendance
  requiresRegistration: {
    type: Boolean,
    default: false
  },

  maxAttendees: {
    type: Number,
    min: [1, 'Maximum attendees must be at least 1']
  },

  registrationDeadline: {
    type: Date
  },

  registrationFee: {
    amount: {
      type: Number,
      min: [0, 'Registration fee cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'NGN' // Nigerian Naira
    }
  },

  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Registered', 'Confirmed', 'Attended', 'No-show', 'Cancelled'],
      default: 'Registered'
    },
    paymentStatus: {
      type: String,
      enum: ['Not Required', 'Pending', 'Paid', 'Refunded'],
      default: 'Not Required'
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }],

  // Event Content and Media
  agenda: [{
    time: {
      type: String,
      required: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)']
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Agenda item title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Agenda item description cannot exceed 300 characters']
    },
    speaker: {
      type: String,
      trim: true,
      maxlength: [100, 'Speaker name cannot exceed 100 characters']
    }
  }],

  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Image caption cannot exceed 200 characters']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  documents: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Document name cannot exceed 100 characters']
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'TXT', 'Other']
    },
    size: {
      type: Number // Size in bytes
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Event Status and Settings
  status: {
    type: String,
    required: [true, 'Event status is required'],
    enum: {
      values: ['Draft', 'Published', 'Cancelled', 'Postponed', 'Completed'],
      message: 'Event status must be Draft, Published, Cancelled, Postponed, or Completed'
    },
    default: 'Draft'
  },

  visibility: {
    type: String,
    required: [true, 'Event visibility is required'],
    enum: {
      values: ['Public', 'Members Only', 'Ministry Only', 'Private'],
      message: 'Event visibility must be Public, Members Only, Ministry Only, or Private'
    },
    default: 'Public'
  },

  isHighlighted: {
    type: Boolean,
    default: false
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  // Communication
  notifications: {
    emailReminder: {
      enabled: {
        type: Boolean,
        default: true
      },
      daysBefore: {
        type: Number,
        default: 1,
        min: [0, 'Days before cannot be negative']
      }
    },
    smsReminder: {
      enabled: {
        type: Boolean,
        default: false
      },
      daysBefore: {
        type: Number,
        default: 1,
        min: [0, 'Days before cannot be negative']
      }
    }
  },

  // Analytics and Tracking
  stats: {
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    registrations: {
      type: Number,
      default: 0,
      min: [0, 'Registrations cannot be negative']
    },
    attendance: {
      type: Number,
      default: 0,
      min: [0, 'Attendance cannot be negative']
    },
    rating: {
      average: {
        type: Number,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
      },
      count: {
        type: Number,
        default: 0,
        min: [0, 'Rating count cannot be negative']
      }
    }
  },

  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],

  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event creator is required']
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// =============================================================================
// INDEXES for Performance Optimization
// =============================================================================

// Composite indexes for common queries
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ category: 1, startDate: 1 });
eventSchema.index({ organizer: 1, startDate: -1 });
eventSchema.index({ ministry: 1, startDate: 1 });
eventSchema.index({ visibility: 1, status: 1, startDate: 1 });

// Text search index
eventSchema.index({
  title: 'text',
  description: 'text',
  'location.venue': 'text',
  tags: 'text'
});

// Geospatial index for location-based queries
eventSchema.index({ 'location.coordinates': '2dsphere' });

// =============================================================================
// VIRTUAL FIELDS
// =============================================================================

/**
 * Virtual field to get event duration in minutes
 */
eventSchema.virtual('duration').get(function() {
  const start = new Date(`2000-01-01 ${this.startTime}`);
  const end = new Date(`2000-01-01 ${this.endTime}`);
  return Math.floor((end - start) / (1000 * 60)); // Duration in minutes
});

/**
 * Virtual field to check if event is currently happening
 */
eventSchema.virtual('isHappening').get(function() {
  const now = new Date();
  const eventStart = new Date(`${this.startDate.toDateString()} ${this.startTime}`);
  const eventEnd = new Date(`${this.endDate.toDateString()} ${this.endTime}`);
  return now >= eventStart && now <= eventEnd;
});

/**
 * Virtual field to check if event is upcoming
 */
eventSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const eventStart = new Date(`${this.startDate.toDateString()} ${this.startTime}`);
  return eventStart > now;
});

/**
 * Virtual field to check if event is past
 */
eventSchema.virtual('isPast').get(function() {
  const now = new Date();
  const eventEnd = new Date(`${this.endDate.toDateString()} ${this.endTime}`);
  return eventEnd < now;
});

/**
 * Virtual field to get current attendee count
 */
eventSchema.virtual('currentAttendeeCount').get(function() {
  return this.attendees ? this.attendees.filter(a => a.status !== 'Cancelled').length : 0;
});

/**
 * Virtual field to check if registration is still open
 */
eventSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.requiresRegistration) return false;
  
  const now = new Date();
  const deadlinePassed = this.registrationDeadline && now > this.registrationDeadline;
  const eventStarted = now >= new Date(`${this.startDate.toDateString()} ${this.startTime}`);
  const maxReached = this.maxAttendees && this.currentAttendeeCount >= this.maxAttendees;
  
  return !deadlinePassed && !eventStarted && !maxReached;
});

// =============================================================================
// MIDDLEWARE (Pre/Post Hooks)
// =============================================================================

/**
 * Pre-save middleware to validate and process event data
 */
eventSchema.pre('save', function(next) {
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first primary image
      this.images.forEach((img, index) => {
        if (img.isPrimary && index > 0) {
          img.isPrimary = false;
        }
      });
    }
  }

  // Validate registration deadline
  if (this.registrationDeadline && this.registrationDeadline > this.startDate) {
    return next(new Error('Registration deadline must be before event start date'));
  }

  // Auto-set registration fee payment requirement
  if (this.attendees) {
    this.attendees.forEach(attendee => {
      if (this.registrationFee.amount > 0) {
        if (attendee.paymentStatus === 'Not Required') {
          attendee.paymentStatus = 'Pending';
        }
      } else {
        attendee.paymentStatus = 'Not Required';
      }
    });
  }

  next();
});

/**
 * Pre-remove middleware to clean up related data
 */
eventSchema.pre('remove', async function(next) {
  // TODO: Add cleanup logic for related data
  // e.g., remove event from user favorites, clean up notifications, etc.
  next();
});

// =============================================================================
// STATIC METHODS
// =============================================================================

/**
 * Find upcoming events within a date range
 * @param {Date} startDate - Start date for search
 * @param {Date} endDate - End date for search
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Array of events
 */
eventSchema.statics.findUpcomingEvents = function(startDate, endDate, options = {}) {
  const query = {
    startDate: { $gte: startDate, $lte: endDate },
    status: 'Published'
  };

  if (options.category) query.category = options.category;
  if (options.ministry) query.ministry = options.ministry;
  if (options.visibility) query.visibility = options.visibility;

  return this.find(query)
    .populate('organizer', 'firstName lastName email')
    .populate('ministry', 'name')
    .sort({ startDate: 1 })
    .limit(options.limit || 50);
};

/**
 * Search events by text
 * @param {string} searchTerm - Search term
 * @param {Object} options - Additional search options
 * @returns {Promise<Array>} Array of matching events
 */
eventSchema.statics.searchEvents = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: 'Published'
  };

  if (options.category) query.category = options.category;
  if (options.startDate) query.startDate = { $gte: options.startDate };

  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('organizer', 'firstName lastName')
    .populate('ministry', 'name')
    .sort({ score: { $meta: 'textScore' }, startDate: 1 })
    .limit(options.limit || 20);
};

// =============================================================================
// INSTANCE METHODS
// =============================================================================

/**
 * Register a user for this event
 * @param {string} userId - User ID to register
 * @param {Object} options - Registration options
 * @returns {Promise<Object>} Registration result
 */
eventSchema.methods.registerUser = async function(userId, options = {}) {
  // Check if registration is open
  if (!this.isRegistrationOpen) {
    throw new Error('Registration is not open for this event');
  }

  // Check if user is already registered
  const existingRegistration = this.attendees.find(
    attendee => attendee.user.toString() === userId.toString()
  );

  if (existingRegistration) {
    throw new Error('User is already registered for this event');
  }

  // Add user to attendees
  this.attendees.push({
    user: userId,
    status: 'Registered',
    paymentStatus: this.registrationFee.amount > 0 ? 'Pending' : 'Not Required',
    notes: options.notes || ''
  });

  // Update stats
  this.stats.registrations = (this.stats.registrations || 0) + 1;

  return this.save();
};

/**
 * Cancel user registration for this event
 * @param {string} userId - User ID to cancel registration
 * @returns {Promise<Object>} Cancellation result
 */
eventSchema.methods.cancelRegistration = async function(userId) {
  const attendeeIndex = this.attendees.findIndex(
    attendee => attendee.user.toString() === userId.toString()
  );

  if (attendeeIndex === -1) {
    throw new Error('User is not registered for this event');
  }

  // Update status instead of removing to maintain history
  this.attendees[attendeeIndex].status = 'Cancelled';

  // Update stats
  this.stats.registrations = Math.max((this.stats.registrations || 1) - 1, 0);

  return this.save();
};

/**
 * Mark user as attended
 * @param {string} userId - User ID to mark as attended
 * @returns {Promise<Object>} Update result
 */
eventSchema.methods.markAttended = async function(userId) {
  const attendee = this.attendees.find(
    attendee => attendee.user.toString() === userId.toString()
  );

  if (!attendee) {
    throw new Error('User is not registered for this event');
  }

  attendee.status = 'Attended';
  this.stats.attendance = (this.stats.attendance || 0) + 1;

  return this.save();
};

// Create and export the model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;