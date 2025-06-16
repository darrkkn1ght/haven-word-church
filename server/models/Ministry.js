const mongoose = require('mongoose');

/**
 * Ministry Schema for Haven Word Church
 * Handles church ministries, departments, and groups
 * 
 * Features:
 * - Ministry information and descriptions
 * - Leadership and member management
 * - Meeting schedules and locations
 * - Contact information
 * - Activity tracking
 * - Nigerian context support
 * 
 * @author Haven Word Church Dev Team
 * @version 1.0.0
 */

const ministrySchema = new mongoose.Schema({
  // Basic Ministry Information
  name: {
    type: String,
    required: [true, 'Ministry name is required'],
    trim: true,
    maxLength: [100, 'Ministry name cannot exceed 100 characters'],
    index: true
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },

  description: {
    type: String,
    required: [true, 'Ministry description is required'],
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },

  detailedDescription: {
    type: String,
    trim: true,
    maxLength: [2000, 'Detailed description cannot exceed 2000 characters']
  },

  // Ministry Category and Type
  category: {
    type: String,
    required: [true, 'Ministry category is required'],
    enum: {
      values: [
        'worship',
        'children',
        'youth',
        'men',
        'women',
        'seniors',
        'outreach',
        'discipleship',
        'service',
        'administration',
        'special',
        'fellowship',
        'prayer',
        'music',
        'media',
        'other'
      ],
      message: 'Please select a valid ministry category'
    },
    index: true
  },

  type: {
    type: String,
    required: [true, 'Ministry type is required'],
    enum: {
      values: ['department', 'ministry', 'group', 'committee', 'team'],
      message: 'Please select a valid ministry type'
    }
  },

  // Leadership Information
  leader: {
    name: {
      type: String,
      required: [true, 'Ministry leader name is required'],
      trim: true,
      maxLength: [100, 'Leader name cannot exceed 100 characters']
    },
    title: {
      type: String,
      trim: true,
      maxLength: [50, 'Leader title cannot exceed 50 characters'],
      default: 'Ministry Leader'
    },
    phone: {
      type: String,
      trim: true,
      match: [/^(\+234|0)[789]\d{9}$/, 'Please provide a valid Nigerian phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    }
  },

  assistantLeaders: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, 'Assistant leader name cannot exceed 100 characters']
    },
    title: {
      type: String,
      trim: true,
      maxLength: [50, 'Assistant leader title cannot exceed 50 characters'],
      default: 'Assistant Leader'
    },
    phone: {
      type: String,
      trim: true,
      match: [/^(\+234|0)[789]\d{9}$/, 'Please provide a valid Nigerian phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    }
  }],

  // Meeting Information
  meetingSchedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'as-needed', 'special'],
      default: 'weekly'
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    time: {
      type: String,
      trim: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
    },
    duration: {
      type: Number, // in minutes
      min: [15, 'Meeting duration must be at least 15 minutes'],
      max: [480, 'Meeting duration cannot exceed 8 hours']
    },
    location: {
      type: String,
      trim: true,
      maxLength: [200, 'Location cannot exceed 200 characters']
    },
    virtualMeeting: {
      enabled: {
        type: Boolean,
        default: false
      },
      platform: {
        type: String,
        enum: ['zoom', 'google-meet', 'teams', 'whatsapp', 'telegram', 'other']
      },
      link: {
        type: String,
        trim: true
      }
    }
  },

  // Membership Information
  membership: {
    currentCount: {
      type: Number,
      default: 0,
      min: [0, 'Member count cannot be negative']
    },
    targetCount: {
      type: Number,
      min: [0, 'Target count cannot be negative']
    },
    requirements: [{
      type: String,
      trim: true,
      maxLength: [200, 'Requirement cannot exceed 200 characters']
    }],
    ageRange: {
      min: {
        type: Number,
        min: [0, 'Minimum age cannot be negative']
      },
      max: {
        type: Number,
        max: [120, 'Maximum age cannot exceed 120']
      }
    },
    gender: {
      type: String,
      enum: ['all', 'male', 'female'],
      default: 'all'
    }
  },

  // Contact and Communication
  contact: {
    primaryPhone: {
      type: String,
      trim: true,
      match: [/^(\+234|0)[789]\d{9}$/, 'Please provide a valid Nigerian phone number']
    },
    whatsappGroup: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      telegram: String
    }
  },

  // Ministry Goals and Objectives
  goals: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, 'Goal title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxLength: [300, 'Goal description cannot exceed 300 characters']
    },
    targetDate: Date,
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'on-hold'],
      default: 'not-started'
    }
  }],

  // Activities and Events
  upcomingActivities: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, 'Activity title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxLength: [300, 'Activity description cannot exceed 300 characters']
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      trim: true,
      maxLength: [200, 'Location cannot exceed 200 characters']
    }
  }],

  // Resources and Materials
  resources: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, 'Resource title cannot exceed 100 characters']
    },
    type: {
      type: String,
      enum: ['document', 'video', 'audio', 'link', 'book', 'other'],
      required: true
    },
    url: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxLength: [200, 'Resource description cannot exceed 200 characters']
    }
  }],

  // Ministry Status and Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'planning'],
    default: 'active',
    index: true
  },

  visibility: {
    type: String,
    enum: ['public', 'members-only', 'private'],
    default: 'public'
  },

  featured: {
    type: Boolean,
    default: false,
    index: true
  },

  // Budget and Financial (optional)
  budget: {
    annual: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'NGN',
      enum: ['NGN', 'USD', 'EUR', 'GBP']
    }
  },

  // SEO and Metadata
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxLength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxLength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },

  // Images and Media
  images: {
    coverImage: {
      type: String,
      trim: true
    },
    gallery: [{
      url: {
        type: String,
        required: true,
        trim: true
      },
      caption: {
        type: String,
        trim: true,
        maxLength: [200, 'Caption cannot exceed 200 characters']
      },
      altText: {
        type: String,
        trim: true,
        maxLength: [100, 'Alt text cannot exceed 100 characters']
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Indexes for optimal query performance
 */
ministrySchema.index({ name: 'text', description: 'text' });
ministrySchema.index({ category: 1, status: 1 });
ministrySchema.index({ featured: -1, createdAt: -1 });
ministrySchema.index({ 'meetingSchedule.dayOfWeek': 1, 'meetingSchedule.time': 1 });

/**
 * Virtual for member count display
 */
ministrySchema.virtual('memberCountDisplay').get(function() {
  const count = this.membership.currentCount;
  if (count === 0) return 'No members yet';
  if (count === 1) return '1 member';
  return `${count} members`;
});

/**
 * Virtual for next meeting info
 */
ministrySchema.virtual('nextMeetingInfo').get(function() {
  if (!this.meetingSchedule.dayOfWeek || !this.meetingSchedule.time) {
    return 'Meeting schedule TBD';
  }
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = days.indexOf(this.meetingSchedule.dayOfWeek);
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  let daysUntilMeeting = dayIndex - dayOfWeek;
  if (daysUntilMeeting <= 0) {
    daysUntilMeeting += 7;
  }
  
  const nextMeeting = new Date(today);
  nextMeeting.setDate(today.getDate() + daysUntilMeeting);
  
  return {
    day: this.meetingSchedule.dayOfWeek,
    time: this.meetingSchedule.time,
    date: nextMeeting,
    daysFromNow: daysUntilMeeting
  };
});

/**
 * Pre-save middleware to generate slug
 */
ministrySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

/**
 * Pre-save middleware to validate age range
 */
ministrySchema.pre('save', function(next) {
  if (this.membership.ageRange.min && this.membership.ageRange.max) {
    if (this.membership.ageRange.min > this.membership.ageRange.max) {
      return next(new Error('Minimum age cannot be greater than maximum age'));
    }
  }
  next();
});

/**
 * Static method to get active ministries by category
 */
ministrySchema.statics.getActiveByCategory = function(category) {
  return this.find({ 
    category, 
    status: 'active',
    visibility: { $in: ['public', 'members-only'] }
  }).sort({ featured: -1, name: 1 });
};

/**
 * Static method to get featured ministries
 */
ministrySchema.statics.getFeatured = function(limit = 6) {
  return this.find({ 
    featured: true, 
    status: 'active',
    visibility: { $in: ['public', 'members-only'] }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

/**
 * Method to get ministry summary for cards/listings
 */
ministrySchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    slug: this.slug,
    description: this.description,
    category: this.category,
    leader: this.leader.name,
    memberCount: this.membership.currentCount,
    meetingDay: this.meetingSchedule.dayOfWeek,
    meetingTime: this.meetingSchedule.time,
    coverImage: this.images.coverImage,
    featured: this.featured
  };
};

/**
 * Method to check if ministry is recruiting
 */
ministrySchema.methods.isRecruiting = function() {
  if (!this.membership.targetCount) return true;
  return this.membership.currentCount < this.membership.targetCount;
};

module.exports = mongoose.model('Ministry', ministrySchema);