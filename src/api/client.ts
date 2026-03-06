import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api.types';

// Auto-detect API base URL (nginx proxy or local development)
const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;

  // If running through nginx proxy (job-scanner or localhost without port)
  if (hostname === 'job-scanner' ||
      (hostname === 'localhost' && !window.location.port)) {
    return '/api';
  }

  // Development mode - direct to Flask backend
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and unwrap data
apiClient.interceptors.response.use(
  (response) => {
    // Backend returns { success: true, data: {...} }
    return response.data;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Try to refresh token
    // Don't try to refresh on login or refresh endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && originalRequest && !isAuthEndpoint) {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Try to refresh the access token
        const response = await axios.post<ApiResponse<{ access_token: string }>>(
          `${getApiBaseUrl()}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        if (response.data.success && response.data.data) {
          const { access_token } = response.data.data;
          localStorage.setItem('access_token', access_token);

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Return structured error
    const apiError: ApiResponse = {
      success: false,
      errorCode: error.response?.data?.errorCode || error.response?.status || 500,
      errorMessage: error.response?.data?.errorMessage || error.message || 'An error occurred',
      errorDetails: error.response?.data?.errorDetails,
      statusCode: error.response?.status,
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
