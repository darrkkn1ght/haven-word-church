import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.REACT_APP_DEBUG_MODE === 'true') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common responses and errors
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.REACT_APP_DEBUG_MODE === 'true') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    const { response, request, message } = error;

    // Handle different error scenarios
    if (response) {
      // Server responded with error status
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data.message);
          break;
        
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
        
        case 422:
          // Validation error
          console.error('Validation error:', data.errors || data.message);
          break;
        
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        
        default:
          console.error('API Error:', data.message || 'Unknown error occurred');
      }
      
      // Return standardized error object
      return Promise.reject({
        status,
        message: data.message || 'An error occurred',
        errors: data.errors || null,
        data: data
      });
      
    } else if (request) {
      // Request was made but no response received (network error)
      console.error('Network error:', message);
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        errors: null,
        data: null
      });
      
    } else {
      // Something else happened
      console.error('Request setup error:', message);
      return Promise.reject({
        status: 0,
        message: 'Request failed to send',
        errors: null,
        data: null
      });
    }
  }
);

// API endpoint functions
export const endpoints = {
  // Authentication
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
    verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  },

  // User profile
  user: {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.put('/user/profile', data),
    changePassword: (passwords) => api.put('/user/change-password', passwords),
    uploadAvatar: (formData) => api.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  },

  // Events
  events: {
    getAll: (params) => api.get('/events', { params }),
    getById: (id) => api.get(`/events/${id}`),
    create: (eventData) => api.post('/events', eventData),
    update: (id, eventData) => api.put(`/events/${id}`, eventData),
    delete: (id) => api.delete(`/events/${id}`),
    register: (id, registrationData) => api.post(`/events/${id}/register`, registrationData),
    getRegistrations: (id) => api.get(`/events/${id}/registrations`),
  },

  // Sermons
  sermons: {
    getAll: (params) => api.get('/sermons', { params }),
    getById: (id) => api.get(`/sermons/${id}`),
    create: (sermonData) => api.post('/sermons', sermonData),
    update: (id, sermonData) => api.put(`/sermons/${id}`, sermonData),
    delete: (id) => api.delete(`/sermons/${id}`),
    getSeries: () => api.get('/sermons/series'),
  },

  // Prayer requests
  prayers: {
    getAll: (params) => api.get('/prayers', { params }),
    getById: (id) => api.get(`/prayers/${id}`),
    create: (prayerData) => api.post('/prayers', prayerData),
    update: (id, prayerData) => api.put(`/prayers/${id}`, prayerData),
    delete: (id) => api.delete(`/prayers/${id}`),
    pray: (id) => api.post(`/prayers/${id}/pray`),
  },

  // Donations/Giving
  donations: {
    create: (donationData) => api.post('/donations', donationData),
    getHistory: (params) => api.get('/donations/history', { params }),
    getStats: () => api.get('/donations/stats'),
  },

  // Blog/News
  blog: {
    getAll: (params) => api.get('/blog', { params }),
    getById: (id) => api.get(`/blog/${id}`),
    create: (postData) => api.post('/blog', postData),
    update: (id, postData) => api.put(`/blog/${id}`, postData),
    delete: (id) => api.delete(`/blog/${id}`),
    getCategories: () => api.get('/blog/categories'),
  },

  // Contact/Messages
  contact: {
    sendMessage: (messageData) => api.post('/contact', messageData),
    getMessages: (params) => api.get('/contact', { params }),
    markAsRead: (id) => api.put(`/contact/${id}/read`),
  },

  // Media/Gallery
  media: {
    getAll: (params) => api.get('/media', { params }),
    upload: (formData) => api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/media/${id}`),
  },

  // Church info
  church: {
    getInfo: () => api.get('/church/info'),
    updateInfo: (data) => api.put('/church/info', data),
    getSchedule: () => api.get('/church/schedule'),
    updateSchedule: (data) => api.put('/church/schedule', data),
  },
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored user data
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Clear auth data
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Handle API errors consistently
  handleError: (error, defaultMessage = 'An error occurred') => {
    if (error.message) {
      return error.message;
    }
    return defaultMessage;
  },

  // Format API data for display
  formatError: (error) => {
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors.map(err => err.message || err).join(', ');
    }
    return error.message || 'An unexpected error occurred';
  },
};

export default api;