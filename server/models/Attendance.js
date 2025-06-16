const mongoose = require('mongoose');

/**
 * Attendance Schema for Haven Word Church
 * Tracks member attendance for services, events, and ministry meetings
 * 
 * Features:
 * - Links to User, Event, Sermon, and Ministry models
 * - Flexible attendance tracking for different activity types
 * - Check-in/check-out timestamps
 * - Notes for special circumstances
 * - Nigerian timezone support
 * 
 * @author Haven Word Church Development Team
 * @version 1.0.0
 */

const attendanceSchema = new mongoose.Schema({
  // User reference - who attended
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for attendance record'],
    index: true
  },

  // Activity Type - what they attended
  activityType: {
    type: String,
    enum: ['service', 'event', 'ministry', 'prayer_meeting', 'bible_study', 'youth_service', 'children_service'],
    required: [true, 'Activity type is required'],
    index: true
  },

  // Reference to specific activity (polymorphic)
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Activity ID is required'],
    index: true
  },

  // Activity details for easier querying
  activityTitle: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [200, 'Activity title cannot exceed 200 characters']
  },

  // Attendance date
  attendanceDate: {
    type: Date,
    required: [true, 'Attendance date is required'],
    index: true
  },

  // Check-in time
  checkInTime: {
    type: Date,
    required: [true, 'Check-in time is required'],
    default: Date.now
  },

  // Check-out time (optional)
  checkOutTime: {
    type: Date,
    validate: {
      validator: function(checkOut) {
        return !checkOut || checkOut > this.checkInTime;
      },
      message: 'Check-out time must be after check-in time'
    }
  },

  // Attendance status
  status: {
    type: String,
    enum: ['present', 'late', 'left_early', 'partial'],
    default: 'present',
    index: true
  },

  // Was this a first-time visitor?
  isFirstTime: {
    type: Boolean,
    default: false,
    index: true
  },

  // Guest information (if brought by member)
  guestBroughtBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Special notes
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },

  // Location/Branch (for multi-campus churches)
  location: {
    type: String,
    default: 'Main Campus',
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },

  // Weather condition (Nigerian context)
  weatherCondition: {
    type: String,
    enum: ['sunny', 'rainy', 'harmattan', 'cloudy', 'stormy'],
    default: 'sunny'
  },

  // Transportation mode (Nigerian context)
  transportationMode: {
    type: String,
    enum: ['walking', 'bus', 'car', 'motorcycle', 'bicycle', 'tricycle', 'online'],
    default: 'walking'
  },

  // Recorded by (admin/usher who recorded attendance)
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recorder information is required']
  },

  // Device/method used for recording
  recordingMethod: {
    type: String,
    enum: ['manual', 'qr_code', 'rfid', 'mobile_app', 'web_portal'],
    default: 'manual'
  },

  // Active status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Indexes for optimized queries
 */
// Compound indexes for common queries
attendanceSchema.index({ user: 1, attendanceDate: -1 });
attendanceSchema.index({ activityType: 1, attendanceDate: -1 });
attendanceSchema.index({ activityId: 1, attendanceDate: -1 });
attendanceSchema.index({ attendanceDate: -1, status: 1 });
attendanceSchema.index({ isFirstTime: 1, attendanceDate: -1 });

// Text index for searching
attendanceSchema.index({ 
  activityTitle: 'text', 
  notes: 'text' 
});

/**
 * Virtual for attendance duration (if check-out recorded)
 */
attendanceSchema.virtual('duration').get(function() {
  if (this.checkOutTime && this.checkInTime) {
    return Math.round((this.checkOutTime - this.checkInTime) / (1000 * 60)); // Duration in minutes
  }
  return null;
});

/**
 * Virtual for determining if attendance was on time
 * Assumes service starts at 9:00 AM Nigerian time
 */
attendanceSchema.virtual('isOnTime').get(function() {
  if (this.activityType === 'service') {
    const serviceStart = new Date(this.attendanceDate);
    serviceStart.setHours(9, 0, 0, 0); // 9:00 AM
    
    return this.checkInTime <= serviceStart;
  }
  return true; // For non-services, consider always on time
});

/**
 * Static method to get attendance statistics for a date range
 * 
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics
 * @param {Object} options - Additional filtering options
 * @returns {Promise<Object>} Attendance statistics
 */
attendanceSchema.statics.getAttendanceStats = async function(startDate, endDate, options = {}) {
  const matchStage = {
    attendanceDate: { $gte: startDate, $lte: endDate },
    isActive: true
  };

  // Add optional filters
  if (options.activityType) matchStage.activityType = options.activityType;
  if (options.location) matchStage.location = options.location;

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAttendance: { $sum: 1 },
        uniqueMembers: { $addToSet: '$user' },
        firstTimeVisitors: {
          $sum: { $cond: ['$isFirstTime', 1, 0] }
        },
        averageCheckInTime: { $avg: '$checkInTime' },
        statusBreakdown: {
          $push: '$status'
        }
      }
    },
    {
      $project: {
        totalAttendance: 1,
        uniqueMemberCount: { $size: '$uniqueMembers' },
        firstTimeVisitors: 1,
        averageCheckInTime: 1,
        statusBreakdown: 1
      }
    }
  ]);

  return stats[0] || {
    totalAttendance: 0,
    uniqueMemberCount: 0,
    firstTimeVisitors: 0,
    averageCheckInTime: null,
    statusBreakdown: []
  };
};

/**
 * Static method to get member attendance history
 * 
 * @param {ObjectId} userId - User ID to get attendance for
 * @param {Object} options - Filtering options
 * @returns {Promise<Array>} User's attendance history
 */
attendanceSchema.statics.getMemberAttendanceHistory = async function(userId, options = {}) {
  const query = { user: userId, isActive: true };
  
  if (options.activityType) query.activityType = options.activityType;
  if (options.startDate && options.endDate) {
    query.attendanceDate = { $gte: options.startDate, $lte: options.endDate };
  }

  return this.find(query)
    .sort({ attendanceDate: -1 })
    .limit(options.limit || 50)
    .populate('recordedBy', 'firstName lastName')
    .populate('guestBroughtBy', 'firstName lastName');
};

/**
 * Instance method to mark check-out
 */
attendanceSchema.methods.checkOut = function() {
  this.checkOutTime = new Date();
  
  // Update status based on check-out time
  const now = new Date();
  const expectedEndTime = new Date(this.attendanceDate);
  
  if (this.activityType === 'service') {
    expectedEndTime.setHours(11, 30, 0, 0); // Assuming service ends at 11:30 AM
  } else {
    expectedEndTime.setHours(expectedEndTime.getHours() + 2); // Default 2-hour duration
  }

  if (now < expectedEndTime) {
    this.status = 'left_early';
  }

  return this.save();
};

/**
 * Pre-save middleware
 */
attendanceSchema.pre('save', function(next) {
  // Set attendance date to date part of check-in time if not provided
  if (!this.attendanceDate && this.checkInTime) {
    this.attendanceDate = new Date(this.checkInTime);
    this.attendanceDate.setHours(0, 0, 0, 0);
  }

  // Determine if user was late
  if (this.activityType === 'service' && this.status === 'present') {
    const serviceStart = new Date(this.attendanceDate);
    serviceStart.setHours(9, 15, 0, 0); // 15 minutes grace period

    if (this.checkInTime > serviceStart) {
      this.status = 'late';
    }
  }

  next();
});

/**
 * Pre-remove middleware to maintain data integrity
 */
attendanceSchema.pre('remove', function(next) {
  // Log the removal for audit purposes
  console.log(`Attendance record being removed: ${this._id} for user: ${this.user}`);
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);