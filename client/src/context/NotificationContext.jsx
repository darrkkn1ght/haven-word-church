import React, { createContext, useContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, notification }}>
      {children}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: 250,
            padding: '12px 24px',
            borderRadius: 8,
            color: '#fff',
            background:
              notification.type === 'success'
                ? '#22c55e'
                : notification.type === 'error'
                ? '#ef4444'
                : '#2563eb',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            fontWeight: 500,
            fontSize: 16,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
