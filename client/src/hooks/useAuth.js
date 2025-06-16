import { useContext, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { ROLES, AUTH_STATUS } from '../utils/constants';

/**
 * Custom hook for authentication operations and state management
 * Provides a clean interface to interact with authentication context
 * 
 * @returns {Object} Authentication state and operations
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login: contextLogin,
    register: contextRegister,
    logout: contextLogout,
    updateProfile: contextUpdateProfile,
    changePassword: contextChangePassword,
    clearError,
    setError
  } = context;

  /**
   * Enhanced login with additional error handling
   */
  const login = useCallback(async (credentials) => {
    try {
      clearError();
      const result = await contextLogin(credentials);
      
      if (result.success) {
        return {
          success: true,
          message: 'Login successful',
          user: result.user
        };
      } else {
        return {
          success: false,
          message: result.message || 'Login failed'
        };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [contextLogin, clearError, setError]);

  /**
   * Enhanced registration with additional error handling
   */
  const register = useCallback(async (userData) => {
    try {
      clearError();
      const result = await contextRegister(userData);
      
      if (result.success) {
        return {
          success: true,
          message: 'Registration successful',
          user: result.user
        };
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed'
        };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [contextRegister, clearError, setError]);

  /**
   * Enhanced logout with cleanup
   */
  const logout = useCallback(() => {
    try {
      contextLogout();
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (err) {
      console.error('Logout error:', err);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }, [contextLogout]);

  /**
   * Enhanced profile update
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      clearError();
      const result = await contextUpdateProfile(profileData);
      
      if (result.success) {
        return {
          success: true,
          message: 'Profile updated successfully',
          user: result.user
        };
      } else {
        return {
          success: false,
          message: result.message || 'Profile update failed'
        };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Profile update failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [contextUpdateProfile, clearError, setError]);

  /**
   * Enhanced password change
   */
  const changePassword = useCallback(async (passwordData) => {
    try {
      clearError();
      const result = await contextChangePassword(passwordData);
      
      if (result.success) {
        return {
          success: true,
          message: 'Password changed successfully'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Password change failed'
        };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Password change failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [contextChangePassword, clearError, setError]);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async (email) => {
    try {
      clearError();
      const result = await authService.requestPasswordReset(email);
      
      if (result.success) {
        return {
          success: true,
          message: 'Password reset email sent'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Password reset request failed'
        };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Password reset request failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [clearError, setError]);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      clearError();
      const result = await authService.resetPassword(token, newPassword);
      
      if (result.success) {
        return {
          success: true,
          message: 'Password reset successful'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Password reset failed'
        };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Password reset failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [clearError, setError]);

  /**
   * Verify email with token
   */
  const verifyEmail = useCallback(async (token) => {
    try {
      clearError();
      const result = await authService.verifyEmail(token);
      
      if (result.success) {
        return {
          success: true,
          message: 'Email verified successfully'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Email verification failed'
        };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Email verification failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [clearError, setError]);

  /**
   * Resend verification email
   */
  const resendVerificationEmail = useCallback(async () => {
    try {
      clearError();
      const result = await authService.resendVerificationEmail();
      
      if (result.success) {
        return {
          success: true,
          message: 'Verification email sent'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to send verification email'
        };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send verification email';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [clearError, setError]);

  // Memoized computed values for performance
  const computedValues = useMemo(() => ({
    // User role checks
    isAdmin: user?.role === ROLES.ADMIN,
    isPastor: user?.role === ROLES.PASTOR,
    isMember: user?.role === ROLES.MEMBER,
    
    // User status checks
    isEmailVerified: user?.isEmailVerified === true,
    isActive: user?.status === AUTH_STATUS.ACTIVE,
    isPending: user?.status === AUTH_STATUS.PENDING,
    isSuspended: user?.status === AUTH_STATUS.SUSPENDED,
    
    // Permission checks
    canManageUsers: user?.role === ROLES.ADMIN,
    canManageContent: [ROLES.ADMIN, ROLES.PASTOR].includes(user?.role),
    canViewMemberArea: [ROLES.ADMIN, ROLES.PASTOR, ROLES.MEMBER].includes(user?.role),
    
    // User display info
    userDisplayName: user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user?.email || 'User',
    userInitials: user?.firstName && user?.lastName 
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || 'U',
    
    // Authentication status
    isFullyAuthenticated: isAuthenticated && user?.isEmailVerified === true,
    needsEmailVerification: isAuthenticated && user?.isEmailVerified === false,
    hasCompletedProfile: user && user.firstName && user.lastName && user.phone
  }), [user, isAuthenticated]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  /**
   * Get user's full profile data
   */
  const getUserProfile = useCallback(() => {
    return user ? { ...user } : null;
  }, [user]);

  return {
    // Authentication state
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    
    // Computed values
    ...computedValues,
    
    // Authentication actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    
    // Utility functions
    hasRole,
    hasAnyRole,
    hasPermission,
    getUserProfile,
    clearError,
    
    // Status helpers
    getAuthStatus: () => ({
      isAuthenticated,
      isLoading,
      error,
      user: user ? { ...user } : null
    })
  };
};

export default useAuth;