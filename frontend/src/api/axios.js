import axios from 'axios';

const configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = configuredUrl.replace(/\/+$/, '').replace(/\/(?:api|health)$/i, '');
const api = axios.create({ baseURL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
