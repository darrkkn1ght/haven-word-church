import axios from 'axios';
import { getToken } from './storageService';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 20000, // 20 seconds (increased to handle backend cold starts)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Attach auth token if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
    if (response) {
      const { status, data } = response;
      switch (status) {
        case 403:
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          console.error('Resource not found:', data.message);
          break;
        case 422:
          console.error('Validation error:', data.errors || data.message);
          break;
        case 500:
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message || 'Unknown error occurred');
      }
      return Promise.reject({
        status,
        message: data.message || 'An error occurred',
        errors: data.errors || null,
        data: data
      });
    } else if (request) {
      console.error('Network error:', message);
      return Promise.reject({
        status: 0,
        message: 'Network error or server is waking up. Please wait a few seconds and try again.',
        errors: null,
        data: null
      });
    } else {
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

// API endpoint functions (authentication and user endpoints removed)
export const endpoints = {
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
    update: (id, postData) => api.put('/blog', postData),
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

  // Site Settings
  settings: {
    getSiteSettings: () => api.get('/settings'),
    updateSiteSettings: (data) => {
      // If uploading a file, use FormData
      if (data.logo) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        return api.put('/settings', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return api.put('/settings', data);
      }
    },
  },

  // Spiritual Growth
  spiritualGrowth: {
    get: () => api.get('/members/dashboard').then(res => res.data.spiritualGrowth),
    update: (data) => api.post('/spiritual-growth', data),
  },

  // Admin Export (Backup/Migration)
  adminExport: {
    getOptions: () => api.get('/admin/export/options'),
    create: (exportData) => api.post('/admin/export', exportData),
    getStatus: (jobId) => api.get(`/admin/export/${jobId}`),
    download: (jobId) => api.get(`/admin/export/${jobId}/download`, { responseType: 'blob' }),
    getHistory: (params) => api.get('/admin/export/history', { params }),
    delete: (jobId) => api.delete(`/admin/export/${jobId}`),
  },

  // Admin Activity Logs
  adminActivityLogs: {
    get: (params) => api.get('/admin/activity-logs', { params }),
    export: (params) => api.get('/admin/activity-logs/export', { params, responseType: 'blob' }),
    delete: (id) => api.delete(`/admin/activity-logs/${id}`),
  },
};

// Utility functions (authentication and user utilities removed)
export const apiUtils = {
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

export function sendContactMessage() {
  // TODO: Implement real API call
  return Promise.resolve({ success: true });
}

export function getEventDetails(id) {
  // TODO: Implement real API call
  return Promise.resolve({ id });
}

export function submitRSVP() {
  // TODO: Implement real API call
  return Promise.resolve({ success: true });
}

export { api };

// Direct exports for Site Settings
export const getSiteSettings = endpoints.settings.getSiteSettings;
export const updateSiteSettings = endpoints.settings.updateSiteSettings;

export default api;
