import axios from 'axios';

const configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const apiRoot = configuredUrl.replace(/\/health\/?$/, '').replace(/\/+$/, '');
const baseURL = apiRoot.endsWith('/api') ? apiRoot : `${apiRoot}/api`;
const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('support-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
