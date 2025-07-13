import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Calendar, Shield, AlertCircle, CheckCircle, ArrowRight, Heart, Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    role: 'member' // Default role
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRedirectSpinner, setShowRedirectSpinner] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || (user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard');
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/.+@.+\..+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (activeTab === 'register' && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (activeTab === 'register') {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.role) newErrors.role = 'Role is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (activeTab === 'login') {
        const result = await login(formData.email, formData.password);
        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        setShowRedirectSpinner(true);
        setTimeout(() => {
          if (result && result.user && result.user.role === 'admin') navigate('/admin/dashboard', { replace: true });
          else navigate('/member/dashboard', { replace: true });
        }, 1500);
      } else {
        // Registration logic: call your register API here
        const { register } = await import('../services/authService');
        const regData = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        await register(regData);
        setMessage('Registration successful! You can now log in.');
        setMessageType('success');
        setTimeout(() => {
          setActiveTab('login');
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'An error occurred');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch between login and register tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setMessage('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      role: 'member' // Reset role to default
    });
  };

  if (showRedirectSpinner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text={message || 'Redirecting to your dashboard...'} />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${activeTab === 'login' ? 'Member Login' : 'Member Registration'} - Haven Word Church`}
        description={`${activeTab === 'login' ? 'Sign in to your member account' : 'Join our church community'} at Haven Word Church. Access member resources, track attendance, and stay connected.`}
        keywords="church login, member portal, Haven Word Church, church registration, member access"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <img src="/logo.jpeg" alt="Haven Word Church Logo" className="w-12 h-12 object-contain rounded-full bg-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Haven Word Church
            </h1>
            <p className="text-gray-600">
              {activeTab === 'login' ? 'Sign in to your member account' : 'Join our church family'}
            </p>
          </div>
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex mb-6">
              <Button
                onClick={() => switchTab('login')}
                variant={activeTab === 'login' ? 'primary' : 'outline'}
                size="md"
                className={`flex-1 rounded-l-lg rounded-r-none ${
                  activeTab === 'login' ? '' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sign In
              </Button>
              <Button
                onClick={() => switchTab('register')}
                variant={activeTab === 'register' ? 'primary' : 'outline'}
                size="md"
                className={`flex-1 rounded-r-lg rounded-l-none ${
                  activeTab === 'register' ? '' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Register
              </Button>
            </div>
            {/* Message Display */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg flex items-center ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200 border'
              }`}>
                {messageType === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                )}
                <span className="text-sm">{message}</span>
              </div>
            )}
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Register Fields */}
              {activeTab === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="John"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Doe"
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                          errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      value={formData.role || 'member'}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="member">Member</option>
                      <option value="pastor">Pastor</option>
                    </select>
                  </div>
                </>
              )}
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={activeTab === 'register' ? 'At least 8 characters' : 'Enter your password'}
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    ariaLabel={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              {/* Confirm Password Field (Register only) */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <Button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      ariaLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700"
              >
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </div>
          {/* Church Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Join Our Church Family
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Experience God&apos;s love, grow in faith, and connect with a community that cares.
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-2" />
                <span>Over 1,000 members strong</span>
              </div>
            </div>
          </div>
          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
