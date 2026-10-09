import axios from 'axios';

// Default to backend API v1 if environment variable is not defined
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardized frontend error handling
    const customMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Network communication failed';

    return Promise.reject(new Error(customMessage));
  }
);
