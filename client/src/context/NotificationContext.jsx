import React, { createContext, useContext, useReducer, useEffect } from 'react';
import socketService from '../services/socketService';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n._id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n._id !== action.payload),
        unreadCount: state.notifications.filter(n => n._id !== action.payload && !n.read).length
      };
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, token } = useAuth();

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (user && token) {
      socketService.connect(token);
      
      // Listen for real-time notifications
      socketService.on('notification', (notification) => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      });

      // Listen for prayer request updates
      socketService.on('prayer_request_update', (data) => {
        const notification = {
          _id: Date.now().toString(),
          type: 'prayer_request_update',
          title: 'Prayer Request Update',
          message: `Your prayer request "${data.title}" has been ${data.status}`,
          read: false,
          createdAt: new Date().toISOString()
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      });

      // Listen for event updates
      socketService.on('event_update', (data) => {
        const notification = {
          _id: Date.now().toString(),
          type: 'event_update',
          title: 'Event Update',
          message: `Event "${data.title}" has been updated`,
          read: false,
          createdAt: new Date().toISOString()
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      });

      // Listen for sermon updates
      socketService.on('sermon_update', (data) => {
        const notification = {
          _id: Date.now().toString(),
          type: 'sermon_update',
          title: 'New Sermon Available',
          message: `New sermon "${data.title}" is now available`,
          read: false,
          createdAt: new Date().toISOString()
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      });

      // Join user-specific room
      socketService.joinRoom(`user_${user._id}`);

      // Join role-specific rooms
      if (user.role === 'admin') {
        socketService.joinRoom('admin');
      }
      if (user.role === 'pastor') {
        socketService.joinRoom('pastor');
      }

      return () => {
        socketService.disconnect();
      };
    }
  }, [user, token]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      const isConnected = socketService.getConnectionStatus();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: isConnected });
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const setNotifications = (notifications) => {
    dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
  };

  const markAsRead = (notificationId) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const deleteNotification = (notificationId) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const sendNotification = (notification) => {
    socketService.sendNotification(notification);
  };

  const value = {
    ...state,
    addNotification,
    setNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    sendNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Add this for backward compatibility
export const useNotification = useNotifications;
