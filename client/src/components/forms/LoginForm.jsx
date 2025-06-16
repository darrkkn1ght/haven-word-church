import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { validateEmail, validateRequired, validateLength } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * LoginForm Component - Member authentication form for Haven Word Church
 * 
 * Features:
 * - Email/username and password authentication
 * - Remember me functionality
 * - Forgot password link
 * - Registration redirect
 * - Nigerian context integration
 * - Real-time validation
 * - Auto-redirect after login
 * - Social login options (optional)
 * - Account lockout protection
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback for successful login
 * @param {Function} props.onError - Callback for login error
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.redirectTo - URL to redirect to after login
 * @param {boolean} props.showRegistration - Whether to show registration link
 * @param {boolean} props.showSocialLogin - Whether to show social login options
 * @param {boolean} props.rememberMeDefault - Default value for remember me
 */
const LoginForm = ({
  onSuccess,
  onError,
  className = '',
  redirectTo = '/member/dashboard',
  showRegistration = true,
  showSocialLogin = false,
  rememberMeDefault = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: authLoading, error: authError } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: rememberMeDefault
  });

  // Component state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Get redirect URL from location state or prop
  const from = location.state?.from?.pathname || redirectTo;

  /**
   * Handle account lockout timer
   */
  useEffect(() => {
    let timer;
    if (lockoutTime) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        if (now >= lockoutTime) {
          setLockoutTime(null);
          setLoginAttempts(0);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  /**
   * Clear auth error when component mounts
   */
  useEffect(() => {
    if (authError) {
      setSubmitError(authError);
    }
  }, [authError]);

  /**
   * Validate individual field
   */
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        error = validateRequired(value, 'Email address is required');
        if (!error) {
          error = validateEmail(value);
        }
        break;

      case 'password':
        error = validateRequired(value, 'Password is required');
        if (!error) {
          error = validateLength(value, 6, 128, 'Password must be at least 6 characters');
        }
        break;

      default:
        break;
    }

    return error;
  };

  /**
   * Validate entire form
   */
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['email', 'password'];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  /**
   * Handle field blur for validation
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  /**
   * Check if account is locked out
   */
  const isLockedOut = () => {
    return lockoutTime && new Date().getTime() < lockoutTime;
  };

  /**
   * Get remaining lockout time in seconds
   */
  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return 0;
    return Math.ceil((lockoutTime - new Date().getTime()) / 1000);
  };

  /**
   * Handle login attempt failure
   */
  const handleLoginFailure = (error) => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);

    // Lock account after 5 failed attempts for 15 minutes
    if (newAttempts >= 5) {
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes
      setLockoutTime(new Date().getTime() + lockoutDuration);
      setSubmitError(`Too many failed login attempts. Account locked for 15 minutes.`);
    } else {
      const remainingAttempts = 5 - newAttempts;
      setSubmitError(`${error.message || 'Invalid credentials'}. ${remainingAttempts} attempts remaining.`);
    }

    if (onError) {
      onError(error);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if account is locked out
    if (isLockedOut()) {
      const remainingTime = getRemainingLockoutTime();
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      setSubmitError(`Account locked. Try again in ${minutes}:${seconds.toString().padStart(2, '0')}`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Attempt login
      const loginData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: formData.rememberMe
      };

      const result = await login(loginData);

      // Success handling
      setLoginAttempts(0);
      setLockoutTime(null);

      if (onSuccess) {
        onSuccess(result);
      }

      // Redirect to intended page
      navigate(from, { replace: true });

    } catch (error) {
      handleLoginFailure(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle social login
   */
  const handleSocialLogin = (provider) => {
    // This would integrate with social auth providers
    window.location.href = `/auth/${provider}?redirect=${encodeURIComponent(from)}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Sign in to your Haven Word Church member account
        </p>
      </div>

      {/* Social Login (Optional) */}
      {showSocialLogin && (
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={isSubmitting || isLockedOut()}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or</span>
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
            disabled={isSubmitting || isLockedOut()}
            autoComplete="email"
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              disabled={isSubmitting || isLockedOut()}
              autoComplete="current-password"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isSubmitting || isLockedOut()}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="mr-2 text-blue-600 focus:ring-blue-500"
              disabled={isSubmitting || isLockedOut()}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
            </div>
          </div>
        )}

        {/* Lockout Timer */}
        {isLockedOut() && (
          <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Account temporarily locked. Try again in {Math.floor(getRemainingLockoutTime() / 60)}:
                {(getRemainingLockoutTime() % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || authLoading || isLockedOut()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isSubmitting || authLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Registration Link */}
        {showRegistration && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <Link
              to="/register"
              state={{ from: location.state?.from }}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Register here
            </Link>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p>
            Having trouble signing in? Contact us at{' '}
            <a href="tel:+2348031234567" className="text-blue-600 hover:underline">+234-803-123-4567</a>{' '}
            or email{' '}
            <a href="mailto:support@havenwordchurch.org" className="text-blue-600 hover:underline">
              support@havenwordchurch.org
            </a>
          </p>
          <p className="mt-2">
            Church office hours: Monday - Friday, 9:00 AM - 5:00 PM (WAT)
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;