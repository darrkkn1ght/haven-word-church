const mongoose = require('mongoose');

/**
 * Activity Log Schema for Haven Word Church
 * Tracks user actions and system events for audit and security
 *
 * Features:
 * - User reference (who performed the action)
 * - Action type (login, create, update, delete, etc.)
 * - Target type and ID (what was affected)
 * - Metadata (details about the action)
 * - IP address and user agent
 * - Success/failure status
 * - Timestamps
 */

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Anonymous actions allowed
  },
  action: {
    type: String,
    required: true,
    enum: [
      'create',
      'update',
      'delete',
      'login',
      'logout',
      'view',
      'get', // Added get as a valid action
      'head', // Added head as a valid action
      'approve', 'reject', 'export', 'import',
      'bulk_action', 'settings_change', 'password_change',
      'error', 'other'
    ],
    default: 'other',
    index: true
  },
  targetType: {
    type: String,
    required: false,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    index: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  metadata: {
    type: Object,
    required: false
  },
  ip: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success',
    index: true
  },
  error: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

activityLogSchema.index({ user: 1, action: 1, targetType: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 