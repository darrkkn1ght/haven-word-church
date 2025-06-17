import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';
import { validateEmail, validatePassword, validatePhone } from '../utils/validators';

/**
 * Authentication Service for Haven Word Church
 * Handles all authentication-related API calls and token management
 */

class AuthService {
  constructor() {
    this.tokenKey = STORAGE_KEYS.AUTH_TOKEN;
    this.userKey = STORAGE_KEYS.USER_DATA;
    this.refreshTokenKey = STORAGE_KEYS.REFRESH_TOKEN;
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Whether to persist login
   * @returns {Promise<Object>} Login response with user data and tokens
   */
  async login(email, password, rememberMe = false) {
    try {
      // Validate input
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!validatePassword(password)) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: email.toLowerCase().trim(),
        password,
        rememberMe
      });

      const { user, token, refreshToken } = response.data;

      // Store authentication data
      this.setAuthData(user, token, refreshToken, rememberMe);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        phone,
        dateOfBirth,
        gender,
        address,
        emergencyContact
      } = userData;

      // Validate required fields
      if (!firstName?.trim() || !lastName?.trim()) {
        throw new Error('First name and last name are required');
      }
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!validatePassword(password)) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (phone && !validatePhone(phone)) {
        throw new Error('Please enter a valid phone number');
      }

      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password,
        phone: phone?.trim(),
        dateOfBirth,
        gender,
        address: address?.trim(),
        emergencyContact
      });

      const { user, token, refreshToken } = response.data;

      // Store authentication data
      this.setAuthData(user, token, refreshToken, false);

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout user and clear authentication data
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // Call logout endpoint to invalidate token on server
        await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Always clear local authentication data
      this.clearAuthData();
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token data
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });

      const { token, refreshToken: newRefreshToken } = response.data;

      // Update stored tokens
      this.setToken(token);
      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken);
      }

      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear auth data if refresh fails
      this.clearAuthData();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify email address
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Verification response
   */
  async verifyEmail(token) {
    try {
      if (!token?.trim()) {
        throw new Error('Verification token is required');
      }

      const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        token: token.trim()
      });

      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request response
   */
  async requestPasswordReset(email) {
    try {
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: email.toLowerCase().trim()
      });

      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Promise<Object>} Reset response
   */
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      if (!token?.trim()) {
        throw new Error('Reset token is required');
      }
      if (!validatePassword(newPassword)) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token: token.trim(),
        password: newPassword
      });

      return response.data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Change user password (authenticated)
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Promise<Object>} Change password response
   */
  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      if (!currentPassword?.trim()) {
        throw new Error('Current password is required');
      }
      if (!validatePassword(newPassword)) {
        throw new Error('New password must be at least 8 characters with uppercase, lowercase, number, and special character');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
      if (currentPassword === newPassword) {
        throw new Error('New password must be different from current password');
      }

      const response = await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword
      });

      return response.data;
    } catch (error) {
      console.error('Password change error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      
      // Update stored user data
      this.setUserData(response.data.user);
      
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile
   * @param {Object} updateData - Profile update data
   * @returns {Promise<Object>} Updated profile response
   */
  async updateProfile(updateData) {
    try {
      const {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        address,
        emergencyContact,
        bio,
        preferences
      } = updateData;

      // Validate required fields
      if (firstName !== undefined && !firstName?.trim()) {
        throw new Error('First name cannot be empty');
      }
      if (lastName !== undefined && !lastName?.trim()) {
        throw new Error('Last name cannot be empty');
      }
      if (phone !== undefined && phone?.trim() && !validatePhone(phone)) {
        throw new Error('Please enter a valid phone number');
      }

      const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        phone: phone?.trim(),
        dateOfBirth,
        gender,
        address: address?.trim(),
        emergencyContact,
        bio: bio?.trim(),
        preferences
      });

      // Update stored user data
      this.setUserData(response.data.user);

      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Resend email verification
   * @returns {Promise<Object>} Resend verification response
   */
  async resendVerification() {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION);
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  // =============================================================================
  // TOKEN MANAGEMENT METHODS
  // =============================================================================

  /**
   * Get stored authentication token
   * @returns {string|null} Authentication token
   */
  getToken() {
    try {
      return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    } catch (error) {
      console.warn('Failed to get token:', error);
      return null;
    }
  }

  /**
   * Set authentication token
   * @param {string} token - Authentication token
   * @param {boolean} persist - Whether to persist in localStorage
   */
  setToken(token, persist = false) {
    try {
      if (persist) {
        localStorage.setItem(this.tokenKey, token);
        sessionStorage.removeItem(this.tokenKey);
      } else {
        sessionStorage.setItem(this.tokenKey, token);
        localStorage.removeItem(this.tokenKey);
      }
    } catch (error) {
      console.warn('Failed to set token:', error);
    }
  }

  /**
   * Get stored refresh token
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    try {
      return localStorage.getItem(this.refreshTokenKey) || sessionStorage.getItem(this.refreshTokenKey);
    } catch (error) {
      console.warn('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Set refresh token
   * @param {string} refreshToken - Refresh token
   * @param {boolean} persist - Whether to persist in localStorage
   */
  setRefreshToken(refreshToken, persist = false) {
    try {
      if (persist) {
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        sessionStorage.removeItem(this.refreshTokenKey);
      } else {
        sessionStorage.setItem(this.refreshTokenKey, refreshToken);
        localStorage.removeItem(this.refreshTokenKey);
      }
    } catch (error) {
      console.warn('Failed to set refresh token:', error);
    }
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data
   */
  getUserData() {
    try {
      const userData = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Set user data
   * @param {Object} userData - User data
   * @param {boolean} persist - Whether to persist in localStorage
   */
  setUserData(userData, persist = false) {
    try {
      const dataString = JSON.stringify(userData);
      if (persist) {
        localStorage.setItem(this.userKey, dataString);
        sessionStorage.removeItem(this.userKey);
      } else {
        sessionStorage.setItem(this.userKey, dataString);
        localStorage.removeItem(this.userKey);
      }
    } catch (error) {
      console.warn('Failed to set user data:', error);
    }
  }

  /**
   * Set all authentication data
   * @param {Object} user - User data
   * @param {string} token - Authentication token
   * @param {string} refreshToken - Refresh token
   * @param {boolean} persist - Whether to persist data
   */
  setAuthData(user, token, refreshToken, persist = false) {
    this.setUserData(user, persist);
    this.setToken(token, persist);
    if (refreshToken) {
      this.setRefreshToken(refreshToken, persist);
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    try {
      // Clear from both localStorage and sessionStorage
      [localStorage, sessionStorage].forEach(storage => {
        storage.removeItem(this.tokenKey);
        storage.removeItem(this.refreshTokenKey);
        storage.removeItem(this.userKey);
      });
    } catch (error) {
      console.warn('Failed to clear auth data:', error);
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUserData();
    return !!(token && user);
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Role check result
   */
  hasRole(role) {
    const user = this.getUserData();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Roles to check
   * @returns {boolean} Role check result
   */
  hasAnyRole(roles) {
    const user = this.getUserData();
    return roles.includes(user?.role);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Handle authentication errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleAuthError(error) {
    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Invalid request data');
        case 401:
          return new Error(data.message || 'Invalid credentials');
        case 403:
          return new Error(data.message || 'Access denied');
        case 404:
          return new Error(data.message || 'User not found');
        case 409:
          return new Error(data.message || 'Email already exists');
        case 422:
          return new Error(data.message || 'Validation failed');
        case 429:
          return new Error(data.message || 'Too many requests. Please try again later');
        case 500:
          return new Error('Server error. Please try again later');
        default:
          return new Error(data.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      return new Error('Network error. Please check your connection');
    } else {
      return error;
    }
  }

  /**
   * Get authentication headers for API requests
   * @returns {Object} Authorization headers
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Create and export singleton instance
const authServiceDefault = new AuthService();
export const authService = authServiceDefault;
export default authServiceDefault;