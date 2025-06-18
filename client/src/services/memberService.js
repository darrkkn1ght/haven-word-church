import api from './api';

export const getDashboard = async () => {
  const res = await api.get('/members/dashboard');
  return res.data;
};
