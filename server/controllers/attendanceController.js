const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * Attendance Controller for Haven Word Church
 * Handles all attendance-related operations
 * 
 * Features:
 * - CRUD operations for attendance records
 * - Bulk attendance recording
 * - Attendance statistics and reports
 * - Member attendance history
 * - Check-in/check-out functionality
 * - Nigerian context support
 * 
 * @author Haven Word Church Development Team
 * @version 1.0.0
 */

/**
 * Create new attendance record
 * 
 * @route POST /api/attendance
 * @access Private (Admin, Ushers)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAttendance = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      user,
      activityType,
      activityId,
      activityTitle,
      attendanceDate,
      checkInTime,
      status,
      isFirstTime,
      guestBroughtBy,
      notes,
      location,
      weatherCondition,
      transportationMode,
      recordingMethod
    } = req.body;

    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate attendance on same day for same activity
    const existingAttendance = await Attendance.findOne({
      user,
      activityId,
      attendanceDate: {
        $gte: new Date(attendanceDate).setHours(0, 0, 0, 0),
        $lt: new Date(attendanceDate).setHours(23, 59, 59, 999)
      },
      isActive: true
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already recorded for this user on this date'
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      user,
      activityType,
      activityId,
      activityTitle,
      attendanceDate: attendanceDate || new Date(),
      checkInTime: checkInTime || new Date(),
      status: status || 'present',
      isFirstTime: isFirstTime || false,
      guestBroughtBy,
      notes,
      location: location || 'Main Campus',
      weatherCondition: weatherCondition || 'sunny',
      transportationMode: transportationMode || 'walking',
      recordedBy: req.user.id,
      recordingMethod: recordingMethod || 'manual'
    });

    await attendance.save();

    // Populate user details for response
    await attendance.populate([
      { path: 'user', select: 'firstName lastName email membershipNumber' },
      { path: 'recordedBy', select: 'firstName lastName' },
      { path: 'guestBroughtBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Bulk create attendance records
 * 
 * @route POST /api/attendance/bulk
 * @access Private (Admin, Ushers)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bulkCreateAttendance = async (req, res) => {
  try {
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance records array is required'
      });
    }

    const results = {
      successful: [],
      failed: [],
      duplicates: []
    };

    for (const record of attendanceRecords) {
      try {
        // Check if user exists
        const userExists = await User.findById(record.user);
        if (!userExists) {
          results.failed.push({
            record,
            error: 'User not found'
          });
          continue;
        }

        // Check for duplicate
        const existingAttendance = await Attendance.findOne({
          user: record.user,
          activityId: record.activityId,
          attendanceDate: {
            $gte: new Date(record.attendanceDate).setHours(0, 0, 0, 0),
            $lt: new Date(record.attendanceDate).setHours(23, 59, 59, 999)
          },
          isActive: true
        });

        if (existingAttendance) {
          results.duplicates.push({
            record,
            existingId: existingAttendance._id
          });
          continue;
        }

        // Create attendance record
        const attendance = new Attendance({
          ...record,
          recordedBy: req.user.id,
          attendanceDate: record.attendanceDate || new Date(),
          checkInTime: record.checkInTime || new Date(),
          status: record.status || 'present',
          location: record.location || 'Main Campus',
          weatherCondition: record.weatherCondition || 'sunny',
          transportationMode: record.transportationMode || 'walking',
          recordingMethod: record.recordingMethod || 'bulk_import'
        });

        await attendance.save();
        results.successful.push(attendance._id);

      } catch (error) {
        results.failed.push({
          record,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Bulk attendance processing completed',
      summary: {
        total: attendanceRecords.length,
        successful: results.successful.length,
        failed: results.failed.length,
        duplicates: results.duplicates.length
      },
      results
    });

  } catch (error) {
    console.error('Error in bulk attendance creation:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get all attendance records with filtering and pagination
 * 
 * @route GET /api/attendance
 * @access Private (Admin, Ushers)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      activityType,
      activityId,
      startDate,
      endDate,
      status,
      location,
      search,
      isFirstTime,
      sortBy = 'attendanceDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (activityType) query.activityType = activityType;
    if (activityId) query.activityId = activityId;
    if (status) query.status = status;
    if (location) query.location = location;
    if (isFirstTime !== undefined) query.isFirstTime = isFirstTime === 'true';

    // Date range filter
    if (startDate || endDate) {
      query.attendanceDate = {};
      if (startDate) query.attendanceDate.$gte = new Date(startDate);
      if (endDate) query.attendanceDate.$lte = new Date(endDate);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('user', 'firstName lastName email membershipNumber profilePicture')
        .populate('recordedBy', 'firstName lastName')
        .populate('guestBroughtBy', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: attendance,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get attendance by ID
 * 
 * @route GET /api/attendance/:id
 * @access Private (Admin, Ushers, Owner)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      isActive: true
    })
    .populate('user', 'firstName lastName email membershipNumber profilePicture')
    .populate('recordedBy', 'firstName lastName')
    .populate('guestBroughtBy', 'firstName lastName');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Update attendance record
 * 
 * @route PUT /api/attendance/:id
 * @access Private (Admin, Ushers)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const attendance = await Attendance.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'status', 'checkOutTime', 'notes', 'transportationMode',
      'weatherCondition', 'recordingMethod'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        attendance[field] = req.body[field];
      }
    });

    await attendance.save();

    await attendance.populate([
      { path: 'user', select: 'firstName lastName email membershipNumber' },
      { path: 'recordedBy', select: 'firstName lastName' },
      { path: 'guestBroughtBy', select: 'firstName lastName' }
    ]);

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating attendance record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Check out attendance (mark departure time)
 * 
 * @route PATCH /api/attendance/:id/checkout
 * @access Private (Admin, Ushers, Owner)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkOut = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out'
      });
    }

    await attendance.checkOut();

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: {
        checkOutTime: attendance.checkOutTime,
        duration: attendance.duration,
        status: attendance.status
      }
    });

  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking out',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Soft delete attendance record
 * 
 * @route DELETE /api/attendance/:id
 * @access Private (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    attendance.isActive = false;
    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting attendance record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get attendance statistics
 * 
 * @route GET /api/attendance/stats
 * @access Private (Admin, Ushers)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAttendanceStats = async (req, res) => {
  try {
    const {
      startDate = new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
      endDate = new Date(),
      activityType,
      location
    } = req.query;

    const options = {};
    if (activityType) options.activityType = activityType;
    if (location) options.location = location;

    const stats = await Attendance.getAttendanceStats(
      new Date(startDate),
      new Date(endDate),
      options
    );

    // Additional breakdown by activity type
    const activityBreakdown = await Attendance.aggregate([
      {
        $match: {
          attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
          isActive: true,
          ...(location && { location })
        }
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          uniqueMembers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          activityType: '$_id',
          count: 1,
          uniqueMemberCount: { $size: '$uniqueMembers' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Weekly trend
    const weeklyTrend = await Attendance.aggregate([
      {
        $match: {
          attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
          isActive: true,
          ...(activityType && { activityType }),
          ...(location && { location })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$attendanceDate' },
            week: { $week: '$attendanceDate' }
          },
          count: { $sum: 1 },
          uniqueMembers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          week: '$_id.week',
          year: '$_id.year',
          count: 1,
          uniqueMemberCount: { $size: '$uniqueMembers' }
        }
      },
      { $sort: { year: 1, week: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats,
        activityBreakdown,
        weeklyTrend,
        dateRange: {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get member attendance history
 * 
 * @route GET /api/attendance/member/:userId
 * @access Private (Admin, Ushers, Owner)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMemberAttendanceHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      activityType,
      startDate,
      endDate,
      limit = 50
    } = req.query;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const options = { limit: parseInt(limit) };
    if (activityType) options.activityType = activityType;
    if (startDate && endDate) {
      options.startDate = new Date(startDate);
      options.endDate = new Date(endDate);
    }

    const attendanceHistory = await Attendance.getMemberAttendanceHistory(userId, options);

    // Calculate member statistics
    const memberStats = await Attendance.aggregate([
      {
        $match: {
          user: user._id,
          isActive: true,
          ...(startDate && endDate && {
            attendanceDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
          })
        }
      },
      {
        $group: {
          _id: null,
          totalAttendance: { $sum: 1 },
          averageCheckInTime: { $avg: '$checkInTime' },
          statusBreakdown: {
            $push: '$status'
          },
          activityTypeBreakdown: {
            $push: '$activityType'
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          membershipNumber: user.membershipNumber
        },
        attendanceHistory,
        statistics: memberStats[0] || {
          totalAttendance: 0,
          averageCheckInTime: null,
          statusBreakdown: [],
          activityTypeBreakdown: []
        }
      }
    });

  } catch (error) {
    console.error('Error fetching member attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching member attendance history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createAttendance,
  bulkCreateAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  checkOut,
  deleteAttendance,
  getAttendanceStats,
  getMemberAttendanceHistory
};