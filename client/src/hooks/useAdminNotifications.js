import { useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from '../services/storageService';

/**
 * useAdminNotifications Hook
 * 
 * Comprehensive admin notification management
 * Handles notifications for content submissions, user activities, and system events
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Notification management functions and state
 */
export const useAdminNotifications = (options = {}) => {
  const {
    enableRealTime = true,
    enableEmailNotifications = true,
    enablePushNotifications = true,
    maxNotifications = 100,
    enableSound = true
  } = options;

  // State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected,] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({});
  const [notificationStats, setNotificationStats] = useState({});
  const [filters,] = useState({
    type: 'all',
    priority: 'all',
    read: 'all'
  });

  // Refs
  const audioRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // Storage keys
  const notificationsKey = 'admin_notifications';
  const settingsKey = 'admin_notification_settings';
  const statsKey = 'admin_notification_stats';

  // Notification types
  const notificationTypes = {
    CONTENT_SUBMISSION: 'content_submission',
    USER_REGISTRATION: 'user_registration',
    PRAYER_REQUEST: 'prayer_request',
    CONTACT_FORM: 'contact_form',
    DONATION: 'donation',
    EVENT_REGISTRATION: 'event_registration',
    SYSTEM_ALERT: 'system_alert',
    MODERATION_REQUIRED: 'moderation_required',
    ATTENDANCE_UPDATE: 'attendance_update',
    MINISTRY_UPDATE: 'ministry_update'
  };

  // Notification priorities
  const notificationPriorities = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  };

  /**
   * Load notifications from storage
   */
  const loadNotifications = useCallback(async () => {
    try {
      const savedNotifications = storageService.getLocal(notificationsKey) || [];
      const savedSettings = storageService.getLocal(settingsKey) || {};
      const savedStats = storageService.getLocal(statsKey) || {};

      setNotifications(savedNotifications);
      setNotificationSettings(savedSettings);
      setNotificationStats(savedStats);
      setUnreadCount(savedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [notificationsKey, settingsKey, statsKey]);

  /**
   * Save notifications to storage
   */
  const saveNotifications = useCallback(async (newNotifications) => {
    try {
      // Keep only the latest notifications
      const limitedNotifications = newNotifications.slice(0, maxNotifications);
      storageService.setLocal(notificationsKey, limitedNotifications);
      setNotifications(limitedNotifications);
      setUnreadCount(limitedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, [notificationsKey, maxNotifications]);

  /**
   * Update notification statistics
   */
  const updateNotificationStats = useCallback((type, priority) => {
    const stats = { ...notificationStats };
    
    // Type stats
    if (!stats.byType) stats.byType = {};
    if (!stats.byType[type]) stats.byType[type] = 0;
    stats.byType[type]++;

    // Priority stats
    if (!stats.byPriority) stats.byPriority = {};
    if (!stats.byPriority[priority]) stats.byPriority[priority] = 0;
    stats.byPriority[priority]++;

    // Total stats
    stats.total = (stats.total || 0) + 1;
    stats.unread = notifications.filter(n => !n.read).length + 1;
    stats.lastUpdated = new Date().toISOString();

    setNotificationStats(stats);
    storageService.setLocal(statsKey, stats);
  }, [notificationStats, notifications, statsKey]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true, readAt: new Date().toISOString() }
        : notification
    );

    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
      readAt: new Date().toISOString()
    }));

    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );

    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  /**
   * Delete all notifications
   */
  const deleteAllNotifications = useCallback(async () => {
    await saveNotifications([]);
  }, [saveNotifications]);

  /**
   * Acknowledge notification (mark as seen but not necessarily read)
   */
  const acknowledgeNotification = useCallback(async (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, acknowledged: true, acknowledgedAt: new Date().toISOString() }
        : notification
    );

    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  /**
   * Get filtered notifications
   */
  const getFilteredNotifications = useCallback(() => {
    return notifications.filter(notification => {
      // Type filter
      if (filters.type !== 'all' && notification.type !== filters.type) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && notification.priority !== filters.priority) {
        return false;
      }

      // Read status filter
      if (filters.read === 'read' && !notification.read) {
        return false;
      }
      if (filters.read === 'unread' && notification.read) {
        return false;
      }

      return true;
    });
  }, [notifications, filters]);

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/notification.mp3');
      }
      audioRef.current.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.log('Error playing notification sound:', error);
    }
  }, []);

  /**
   * Show desktop notification
   */
  const showDesktopNotification = useCallback((notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/havenword.jpeg',
        badge: '/favicon-32x32.png',
        tag: notification.id,
        data: notification,
        requireInteraction: notification.priority === notificationPriorities.URGENT
      });

      desktopNotification.onclick = () => {
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
        desktopNotification.close();
      };

      // Auto-close after 5 seconds for non-urgent notifications
      if (notification.priority !== notificationPriorities.URGENT) {
        setTimeout(() => {
          desktopNotification.close();
        }, 5000);
      }
    }
  }, [notificationPriorities.URGENT]);

  /**
   * Request notification permissions
   */
  const requestNotificationPermissions = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  /**
   * Update notification settings
   */
  const updateNotificationSettings = useCallback(async (newSettings) => {
    const updatedSettings = { ...notificationSettings, ...newSettings };
    setNotificationSettings(updatedSettings);
    storageService.setLocal(settingsKey, updatedSettings);
  }, [notificationSettings, settingsKey]);

  /**
   * Get notification statistics
   */
  const getNotificationStats = useCallback(() => {
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {},
      byPriority: {},
      recent: notifications.slice(0, 10)
    };

    // Count by type
    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    // Count by priority
    notifications.forEach(notification => {
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
    });

    return stats;
  }, [notifications]);

  /**
   * Export notifications
   */
  const exportNotifications = useCallback((format = 'json') => {
    const data = {
      notifications: getFilteredNotifications(),
      stats: getNotificationStats(),
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin_notifications_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [getFilteredNotifications, getNotificationStats]);

  /**
   * Clean up expired notifications
   */
  const cleanupExpiredNotifications = useCallback(async () => {
    const now = new Date();
    const validNotifications = notifications.filter(notification => {
      if (!notification.expiresAt) return true;
      return new Date(notification.expiresAt) > now;
    });

    if (validNotifications.length !== notifications.length) {
      await saveNotifications(validNotifications);
    }
  }, [notifications, saveNotifications]);

  // Initialize on mount
  useEffect(() => {
    loadNotifications();
    cleanupExpiredNotifications();
  }, [loadNotifications, cleanupExpiredNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    const timeoutId = notificationTimeoutRef.current;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Move the definition of createNotification back below its dependencies, but above where it is used.
  const createNotification = useCallback(async (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(), // Simple ID generation
      createdAt: new Date().toISOString(),
      read: false,
      acknowledged: false,
      readAt: null,
      acknowledgedAt: null,
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString() : null
    };

    const updatedNotifications = [...notifications, newNotification];
    await saveNotifications(updatedNotifications);
    updateNotificationStats(newNotification.type, newNotification.priority);

    if (enableRealTime) {
      showDesktopNotification(newNotification);
      if (enablePushNotifications && notification.push) {
        // Implement push notification logic here
      }
      if (enableEmailNotifications && notification.email) {
        // Implement email notification logic here
      }
      if (enableSound && notification.sound) {
        playNotificationSound();
      }
    }
  }, [
    notifications,
    saveNotifications,
    updateNotificationStats,
    showDesktopNotification,
    enableRealTime,
    enablePushNotifications,
    enableEmailNotifications,
    enableSound,
    playNotificationSound
  ]);

  return {
    // State
    notifications,
    unreadCount,
    isConnected,
    notificationSettings,
    notificationStats,
    filters,

    // Core functions
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    acknowledgeNotification,

    // Utility functions
    getFilteredNotifications,
    updateNotificationSettings,
    getNotificationStats,
    exportNotifications,
    requestNotificationPermissions,

    // Configuration
    notificationTypes,
    notificationPriorities,
    enableRealTime,
    enableEmailNotifications,
    enablePushNotifications
  };
};

export default useAdminNotifications; 