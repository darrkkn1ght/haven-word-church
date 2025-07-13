import api from './api';

// Dashboard
export const getDashboard = async () => {
  const res = await api.get('/members/dashboard');
  return res.data;
};

// Attendance
export const getAttendance = async (filters) => {
  const res = await api.get('/members/attendance', { params: filters });
  return res.data;
};

export const exportAttendance = async (filters) => {
  const res = await api.get('/members/attendance/export', { params: filters, responseType: 'blob' });
  return res;
};

// Prayer Requests
export const getPrayerRequests = async (params = {}) => {
  const res = await api.get('/members/prayer-requests', { params });
  return res.data;
};

export const createPrayerRequest = async (data) => {
  const res = await api.post('/members/prayer-requests', data);
  return res.data;
};

export const updatePrayerRequest = async (id, data) => {
  const res = await api.put(`/members/prayer-requests/${id}`, data);
  return res.data;
};

export const deletePrayerRequest = async (id) => {
  const res = await api.delete(`/members/prayer-requests/${id}`);
  return res.data;
};

// Donations
export const getDonations = async (params = {}) => {
  const res = await api.get('/members/donations', { params });
  return res.data;
};

export const createDonation = async (data) => {
  const res = await api.post('/members/donations', data);
  return res.data;
};

// Profile Management
export const getProfile = async () => {
  const res = await api.get('/members/profile');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put('/members/profile', data);
  return res.data;
};

export const changePassword = async (data) => {
  const res = await api.put('/members/change-password', data);
  return res.data;
};

export const uploadProfilePhoto = async (formData) => {
  const res = await api.post('/members/upload-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Event RSVP
export const getMyEvents = async (params = {}) => {
  const res = await api.get('/members/my-events', { params });
  return res.data;
};

export const rsvpToEvent = async (eventId, data) => {
  const res = await api.post(`/members/events/${eventId}/rsvp`, data);
  return res.data;
};

// Legacy memberService object for backward compatibility
export const memberService = {
  getDashboard,
  getAttendance,
  exportAttendance,
  getPrayerRequests,
  createPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest,
  getDonations,
  createDonation,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePhoto,
  getMyEvents,
  rsvpToEvent
};
