import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Bell, 
  Check, 
  X, 
  Trash2, 
  Filter, 
  Settings, 
  Download,
  AlertCircle,
  Info,
  User,
  FileText,
  Heart,
  Mail,
  DollarSign,
  Calendar,
  Users,
  Shield,
  TrendingUp,
  Volume2,
  VolumeX
} from 'lucide-react';
import Button from '../ui/Button';
import useAdminNotifications from '../../hooks/useAdminNotifications';

/**
 * AdminNotificationCenter Component
 * 
 * Comprehensive admin notification management interface
 * Provides filtering, actions, and real-time updates for admin notifications
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onNotificationClick - Callback when notification is clicked
 * @param {Object} props.options - Component options
 */
const AdminNotificationCenter = ({
  onNotificationClick,
  options = {}
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Notification hook
  const {
    unreadCount,
    notificationSettings,
    filters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getFilteredNotifications,
    updateNotificationSettings,
    getNotificationStats,
    exportNotifications,
    requestNotificationPermissions,
    notificationTypes,
    notificationPriorities
  } = useAdminNotifications(options);

  // Refs
  const notificationRef = useRef(null);

  /**
   * Handle notification click
   */
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    setSelectedNotification(notification);
  };

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (type) => {
    const icons = {
      [notificationTypes.CONTENT_SUBMISSION]: FileText,
      [notificationTypes.USER_REGISTRATION]: User,
      [notificationTypes.PRAYER_REQUEST]: Heart,
      [notificationTypes.CONTACT_FORM]: Mail,
      [notificationTypes.DONATION]: DollarSign,
      [notificationTypes.EVENT_REGISTRATION]: Calendar,
      [notificationTypes.SYSTEM_ALERT]: AlertCircle,
      [notificationTypes.MODERATION_REQUIRED]: Shield,
      [notificationTypes.ATTENDANCE_UPDATE]: TrendingUp,
      [notificationTypes.MINISTRY_UPDATE]: Users
    };
    return icons[type] || Info;
  };

  /**
   * Get notification priority color
   */
  const getPriorityColor = (priority) => {
    const colors = {
      [notificationPriorities.LOW]: 'text-gray-500 bg-gray-100',
      [notificationPriorities.NORMAL]: 'text-blue-600 bg-blue-100',
      [notificationPriorities.HIGH]: 'text-orange-600 bg-orange-100',
      [notificationPriorities.URGENT]: 'text-red-600 bg-red-100'
    };
    return colors[priority] || colors[notificationPriorities.NORMAL];
  };

  /**
   * Format notification time
   */
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  /**
   * Filter notifications by search term
   */
  const getSearchFilteredNotifications = () => {
    const filtered = getFilteredNotifications();
    
    if (!searchTerm) return filtered;
    
    return filtered.filter(notification =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = getSearchFilteredNotifications();
  const stats = getNotificationStats();

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-600 hover:text-gray-800"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Notification Settings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Desktop Notifications</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={requestNotificationPermissions}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Enable
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sound Alerts</span>
                  <button
                    onClick={() => updateNotificationSettings({ soundEnabled: !notificationSettings.soundEnabled })}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {notificationSettings.soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filters.type}
                onChange={(e) => updateNotificationSettings({ type: e.target.value })}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                {Object.entries(notificationTypes).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.priority}
                onChange={(e) => updateNotificationSettings({ priority: e.target.value })}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                {Object.entries(notificationPriorities).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer transition-colors ${
                        notification.read
                          ? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                          : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-800'
                        }`}>
                          <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-900 dark:text-white' : 'text-blue-900 dark:text-blue-100'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center space-x-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                            
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stats.total} total • {stats.unread} unread
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportNotifications()}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                {filteredNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deleteAllNotifications}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notification Details
              </h3>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {selectedNotification.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedNotification.message}
                </p>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Type: {selectedNotification.type}</p>
                <p>Priority: {selectedNotification.priority}</p>
                <p>Created: {formatNotificationTime(selectedNotification.createdAt)}</p>
              </div>
              
              {selectedNotification.actionUrl && (
                <Button
                  variant="primary"
                  onClick={() => {
                    window.open(selectedNotification.actionUrl, '_blank');
                    setSelectedNotification(null);
                  }}
                  className="w-full"
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AdminNotificationCenter.propTypes = {
  onNotificationClick: PropTypes.func,
  options: PropTypes.object
};

export default AdminNotificationCenter; 