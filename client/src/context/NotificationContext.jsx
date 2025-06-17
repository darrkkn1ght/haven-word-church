import React, { createContext, useContext } from 'react';

export const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export default NotificationContext;
