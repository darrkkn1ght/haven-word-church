const Notification = require('../models/Notification');

/**
 * Notification Service
 * Handles real-time notifications for the church application
 */
class NotificationService {
  /**
   * Send notification to a specific user
   * @param {string} userId - User ID to send notification to
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type (event, prayer, general, etc.)
   * @param {Object} data - Additional data for the notification
   */
  static async sendToUser(userId, title, message, type = 'general', data = {}) {
    try {
      // Save notification to database
      const notification = new Notification({
        user: userId,
        title,
        message,
        type,
        data
      });
      await notification.save();

      // Send real-time notification if user is online
      const socketId = global.connectedUsers.get(userId);
      if (socketId) {
        global.io.to(socketId).emit('notification', {
          id: notification._id,
          title,
          message,
          type,
          data,
          createdAt: notification.createdAt
        });
      }

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {Object} data - Additional data
   */
  static async sendToUsers(userIds, title, message, type = 'general', data = {}) {
    try {
      const notifications = [];
      
      for (const userId of userIds) {
        const notification = await this.sendToUser(userId, title, message, type, data);
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error sending notifications to users:', error);
      throw error;
    }
  }

  /**
   * Send notification to all online users
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {Object} data - Additional data
   */
  static async sendToAllOnline(title, message, type = 'general', data = {}) {
    try {
      // Broadcast to all connected users
      global.io.emit('notification', {
        title,
        message,
        type,
        data,
        createdAt: new Date()
      });

      return { success: true, recipients: global.connectedUsers.size };
    } catch (error) {
      console.error('Error sending notification to all online users:', error);
      throw error;
    }
  }

  /**
   * Send notification to users in a specific room
   * @param {string} room - Room name
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {Object} data - Additional data
   */
  static async sendToRoom(room, title, message, type = 'general', data = {}) {
    try {
      global.io.to(room).emit('notification', {
        title,
        message,
        type,
        data,
        createdAt: new Date()
      });

      return { success: true, room };
    } catch (error) {
      console.error('Error sending notification to room:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { read: true },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   */
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
      );

      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   * @param {string} userId - User ID
   */
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        user: userId,
        read: false
      });

      return count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  }

  /**
   * Delete old notifications (cleanup)
   * @param {number} daysOld - Number of days old to delete
   */
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        read: true
      });

      return result;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService; 