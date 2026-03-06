import apiClient from './client';
import type { ApiResponse, LoginRequest, LoginResponse, RefreshTokenRequest } from '@/types/api.types';

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    if (!response.data) {
      throw new Error('Login failed');
    }
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Refresh token
  refreshToken: async (request: RefreshTokenRequest): Promise<{ access_token: string }> => {
    const response = await apiClient.post<ApiResponse<{ access_token: string }>>('/auth/refresh', request);
    if (!response.data) {
      throw new Error('Token refresh failed');
    }
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/auth/me');
    return response.data;
  },
};
