const ActivityLog = require('../models/ActivityLog');

/**
 * Logs a user activity or system event
 * @param {Object} params - Log parameters
 * @param {ObjectId} [params.user] - User ID (optional)
 * @param {String} params.action - Action type (required)
 * @param {String} [params.targetType] - Target type (e.g., 'Blog', 'User')
 * @param {ObjectId|String} [params.targetId] - Target ID (optional)
 * @param {String} [params.description] - Human-readable description
 * @param {Object} [params.metadata] - Additional metadata
 * @param {String} [params.ip] - IP address
 * @param {String} [params.userAgent] - User agent string
 * @param {String} [params.status] - 'success' or 'failure'
 * @param {String} [params.error] - Error message if any
 * @returns {Promise<void>}
 */
async function logActivity({
  user,
  action,
  targetType,
  targetId,
  description,
  metadata,
  ip,
  userAgent,
  status = 'success',
  error
}) {
  try {
    await ActivityLog.create({
      user,
      action,
      targetType,
      targetId,
      description,
      metadata,
      ip,
      userAgent,
      status,
      error
    });
  } catch (err) {
    // Do not throw, just log error
    console.error('Activity logging failed:', err);
  }
}

module.exports = { logActivity }; 