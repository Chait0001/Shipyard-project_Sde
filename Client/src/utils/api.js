import axios from 'axios';

// Get base URL from environment or default to local development port 5001
const baseURL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT Bearer Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shipyard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), automatically clear token and redirect to login if appropriate
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('shipyard_token');
      localStorage.removeItem('shipyard_user');
      // If we aren't already on the login or register pages, redirect
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
