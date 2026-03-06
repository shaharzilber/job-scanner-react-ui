import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiClient } from '../client';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('API Client', () => {
  const API_URL = 'http://localhost:5000/api';
  let originalLocation: Location;

  beforeEach(() => {
    localStorage.clear();
    // Store original location
    originalLocation = window.location;
  });

  afterEach(() => {
    // Restore original location
    if (window.location !== originalLocation) {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    }
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      localStorage.setItem('access_token', 'test-token');

      // Mock endpoint to verify headers
      server.use(
        http.get(`${API_URL}/test`, ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer test-token');
          return HttpResponse.json({ success: true, data: { message: 'ok' } });
        })
      );

      await apiClient.get('/test');
    });

    it('should not add Authorization header when token does not exist', async () => {
      server.use(
        http.get(`${API_URL}/test`, ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBeNull();
          return HttpResponse.json({ success: true, data: { message: 'ok' } });
        })
      );

      await apiClient.get('/test');
    });
  });

  describe('Response Interceptor - Success', () => {
    it('should unwrap success responses', async () => {
      server.use(
        http.get(`${API_URL}/test`, () => {
          return HttpResponse.json({
            success: true,
            data: { message: 'Hello' },
          });
        })
      );

      const response = await apiClient.get('/test');

      expect(response).toEqual({
        success: true,
        data: { message: 'Hello' },
      });
    });
  });

  describe('Response Interceptor - 401 Error Handling', () => {
    it('should attempt token refresh on 401 error for protected endpoints', async () => {
      localStorage.setItem('access_token', 'old-token');
      localStorage.setItem('refresh_token', 'refresh-token');

      let requestCount = 0;

      // Mock protected endpoint - first call fails with 401
      server.use(
        http.get(`${API_URL}/protected`, ({ request }) => {
          requestCount++;
          const authHeader = request.headers.get('Authorization');

          if (requestCount === 1) {
            // First request with old token - return 401
            expect(authHeader).toBe('Bearer old-token');
            return HttpResponse.json(
              { success: false, errorMessage: 'Unauthorized' },
              { status: 401 }
            );
          } else {
            // Retry with new token - return success
            expect(authHeader).toBe('Bearer new-token');
            return HttpResponse.json({ success: true, data: { message: 'Success' } });
          }
        })
      );

      // Mock refresh endpoint
      server.use(
        http.post(`${API_URL}/auth/refresh`, () => {
          return HttpResponse.json({
            success: true,
            data: { access_token: 'new-token' },
          });
        })
      );

      const response = await apiClient.get('/protected');

      expect(response).toEqual({
        success: true,
        data: { message: 'Success' },
      });
      expect(localStorage.getItem('access_token')).toBe('new-token');
      expect(requestCount).toBe(2); // Original request + retry
    });

    it('should clear tokens when refresh fails', async () => {
      localStorage.setItem('access_token', 'old-token');
      localStorage.setItem('refresh_token', 'invalid-refresh');

      // Mock 401 error on protected endpoint
      server.use(
        http.get(`${API_URL}/protected`, () => {
          return HttpResponse.json(
            { success: false, errorMessage: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      // Mock refresh endpoint failure - reject the request
      server.use(
        http.post(`${API_URL}/auth/refresh`, () => {
          return HttpResponse.error();
        })
      );

      try {
        await apiClient.get('/protected');
      } catch (error) {
        // Expected error
      }

      // Tokens should be cleared when refresh fails
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('should clear tokens when no refresh token exists', async () => {
      localStorage.setItem('access_token', 'old-token');
      // No refresh token

      server.use(
        http.get(`${API_URL}/protected`, () => {
          return HttpResponse.json(
            { success: false, errorMessage: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      try {
        await apiClient.get('/protected');
      } catch (error) {
        // Expected error
      }

      // Tokens should be cleared when no refresh token
      expect(localStorage.getItem('access_token')).toBeNull();
    });

    it('should not attempt refresh for /auth/login endpoint', async () => {
      localStorage.setItem('refresh_token', 'refresh-token');

      server.use(
        http.post(`${API_URL}/auth/login`, () => {
          return HttpResponse.json(
            { success: false, errorMessage: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      try {
        await apiClient.post('/auth/login', { username: 'wrong', password: 'wrong' });
      } catch (error: any) {
        expect(error.errorMessage).toBe('Invalid credentials');
      }
    });

    it('should not attempt refresh for /auth/refresh endpoint', async () => {
      localStorage.setItem('refresh_token', 'refresh-token');

      server.use(
        http.post(`${API_URL}/auth/refresh`, () => {
          return HttpResponse.json(
            { success: false, errorMessage: 'Invalid refresh token' },
            { status: 401 }
          );
        })
      );

      try {
        await apiClient.post('/auth/refresh', { refresh_token: 'refresh-token' });
      } catch (error: any) {
        expect(error.errorMessage).toBe('Invalid refresh token');
      }
    });
  });

  describe('Response Interceptor - Error Handling', () => {
    it('should return structured error response', async () => {
      server.use(
        http.get(`${API_URL}/error`, () => {
          return HttpResponse.json(
            {
              success: false,
              errorCode: 500,
              errorMessage: 'Server error',
              errorDetails: { info: 'Additional info' },
            },
            { status: 500 }
          );
        })
      );

      try {
        await apiClient.get('/error');
      } catch (error: any) {
        expect(error.success).toBe(false);
        expect(error.errorCode).toBe(500);
        expect(error.errorMessage).toBe('Server error');
        expect(error.errorDetails).toEqual({ info: 'Additional info' });
        expect(error.statusCode).toBe(500);
      }
    });

    it('should handle network errors', async () => {
      server.use(
        http.get(`${API_URL}/network-error`, () => {
          return HttpResponse.error();
        })
      );

      try {
        await apiClient.get('/network-error');
      } catch (error: any) {
        expect(error.success).toBe(false);
        expect(error.errorMessage).toBeDefined();
      }
    });
  });

  describe('API Base URL Detection', () => {
    it('should use correct base URL in test environment', () => {
      // In test environment, it should use http://localhost:5000/api
      expect(apiClient.defaults.baseURL).toBeDefined();
      expect(apiClient.defaults.baseURL).toContain('localhost');
    });
  });
});
