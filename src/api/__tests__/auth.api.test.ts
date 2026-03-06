import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi } from '../auth.api';
import apiClient from '../client';

// Mock the API client
vi.mock('../client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call POST /auth/login with credentials', async () => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          user: {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
          },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await authApi.login({ username: 'admin', password: 'Admin@123456' });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        username: 'admin',
        password: 'Admin@123456',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when response data is missing', async () => {
      const mockResponse = {
        success: true,
        data: null,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await expect(
        authApi.login({ username: 'admin', password: 'wrong' })
      ).rejects.toThrow('Login failed');
    });

    it('should throw error when API returns error', async () => {
      const mockError = {
        success: false,
        errorMessage: 'Invalid credentials',
      };

      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(
        authApi.login({ username: 'wrong', password: 'wrong' })
      ).rejects.toEqual(mockError);
    });
  });

  describe('logout', () => {
    it('should call POST /auth/logout', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ success: true });

      await authApi.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should not throw error on logout failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(authApi.logout()).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should call POST /auth/refresh with refresh_token', async () => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'new-access-token',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await authApi.refreshToken({ refresh_token: 'test-refresh-token' });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: 'test-refresh-token',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when response data is missing', async () => {
      const mockResponse = {
        success: true,
        data: null,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      await expect(
        authApi.refreshToken({ refresh_token: 'invalid' })
      ).rejects.toThrow('Token refresh failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should call GET /auth/me', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await authApi.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });

    it('should return undefined when no user data', async () => {
      const mockResponse = {
        success: true,
        data: undefined,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await authApi.getCurrentUser();

      expect(result).toBeUndefined();
    });
  });
});
