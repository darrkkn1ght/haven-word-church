import React from 'react';
import { HelmetProvider } from 'react-helmet-async';

const AppWithHelmetProvider = ({ children }) => (
  <HelmetProvider>
    {children}
  </HelmetProvider>
);

export default AppWithHelmetProvider;
