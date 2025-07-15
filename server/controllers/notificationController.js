const Notification = require('../models/Notification');
const NotificationService = require('../utils/notificationService');

/**
 * Get notifications for a user
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { user: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Notification.countDocuments(query);
    const unreadCount = await NotificationService.getUnreadCount(userId);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load notifications.' });
  }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await NotificationService.markAsRead(notificationId, userId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    res.json({ 
      message: 'Notification marked as read.',
      notification 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notification as read.' });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await NotificationService.markAllAsRead(userId);

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications as read.' });
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    res.json({ message: 'Notification deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification.' });
  }
};

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.getUnreadCount(userId);

    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get unread count.' });
  }
};

/**
 * Send notification (Admin only)
 */
exports.sendNotification = async (req, res) => {
  try {
    const { userIds, title, message, type, data } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    let result;
    if (userIds && userIds.length > 0) {
      // Send to specific users
      result = await NotificationService.sendToUsers(userIds, title, message, type, data);
    } else {
      // Send to all online users
      result = await NotificationService.sendToAllOnline(title, message, type, data);
    }

    res.json({ 
      message: 'Notification sent successfully.',
      result 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send notification.' });
  }
};

/**
 * Send notification to room (Admin only)
 */
exports.sendToRoom = async (req, res) => {
  try {
    const { room, title, message, type, data } = req.body;

    if (!room || !title || !message) {
      return res.status(400).json({ message: 'Room, title, and message are required.' });
    }

    const result = await NotificationService.sendToRoom(room, title, message, type, data);

    res.json({ 
      message: 'Notification sent to room successfully.',
      result 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send notification to room.' });
  }
}; 