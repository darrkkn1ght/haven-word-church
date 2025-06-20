import React from 'react';
import PropTypes from 'prop-types';
import { HelmetProvider } from 'react-helmet-async';

const AppWithHelmetProvider = ({ children }) => (
  <HelmetProvider>
    {children}
  </HelmetProvider>
);

AppWithHelmetProvider.propTypes = {
  children: PropTypes.node,
};

export default AppWithHelmetProvider;
