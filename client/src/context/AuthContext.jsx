import React, { createContext, useState, useEffect } from 'react';
import { setToken, removeToken, getUserFromToken } from '../services/storageService';
import { login as loginService } from '../services/authService';

export const AuthContext = createContext();

import PropTypes from 'prop-types';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUserFromToken());

  const login = async (email, password) => {
    const { token, user } = await loginService(email, password);
    setToken(token);
    setUser(user);
    return { token, user };
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  useEffect(() => {
    setUser(getUserFromToken());
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};
