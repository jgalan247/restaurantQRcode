import axios, { AxiosInstance } from 'axios';

// Log environment variable for debugging
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
console.log('import.meta.env:', import.meta.env);

const API_URL = import.meta.env.VITE_API_URL || 'https://seahorse-app-zxz5f.ondigitalocean.app/api/v1';
console.log('Using API_URL:', API_URL);

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || 'Bad request');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;
