import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '../authStore';
import { authApi } from '@/api/auth.api';
import type { LoginResponse } from '@/types/api.types';

// Mock the auth API
vi.mock('@/api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state
    act(() => {
      useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        user: null,
        isLoading: false,
        error: null,
      });
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful login', async () => {
    const mockLoginResponse: LoginResponse = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      user: {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
      },
    };

    vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({ username: 'admin', password: 'Admin@123456' });
    });

    expect(result.current.accessToken).toBe('test-access-token');
    expect(result.current.refreshToken).toBe('test-refresh-token');
    expect(result.current.user).toEqual(mockLoginResponse.user);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    // Check localStorage
    expect(localStorage.getItem('access_token')).toBe('test-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('test-refresh-token');
  });

  it('should handle login error', async () => {
    const mockError = {
      errorMessage: 'Invalid credentials',
    };

    vi.mocked(authApi.login).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      try {
        await result.current.login({ username: 'wrong', password: 'wrong' });
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');

    // Check localStorage is empty
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('should handle logout', () => {
    const { result } = renderHook(() => useAuthStore());

    // Set initial state
    act(() => {
      useAuthStore.setState({
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        user: { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin' },
      });
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh');
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();

    // Check localStorage is cleared
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();

    // Check logout API was called
    expect(authApi.logout).toHaveBeenCalled();
  });

  it('should update tokens with setTokens', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setTokens('new-access-token', 'new-refresh-token');
    });

    expect(result.current.accessToken).toBe('new-access-token');
    expect(result.current.refreshToken).toBe('new-refresh-token');

    // Check localStorage is updated
    expect(localStorage.getItem('access_token')).toBe('new-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token');
  });

  it('should clear error with clearError', () => {
    const { result } = renderHook(() => useAuthStore());

    // Set error
    act(() => {
      useAuthStore.setState({ error: 'Some error' });
    });

    expect(result.current.error).toBe('Some error');

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should only persist user field to localStorage', () => {
    const { result } = renderHook(() => useAuthStore());

    // Set full state
    act(() => {
      useAuthStore.setState({
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        user: { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin' },
      });
    });

    // Check that only user is persisted (via zustand persist)
    const persistedData = localStorage.getItem('auth-storage');
    expect(persistedData).toBeTruthy();

    if (persistedData) {
      const parsed = JSON.parse(persistedData);
      expect(parsed.state.user).toEqual({
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
      });
      // Tokens should not be in persisted storage (only in separate localStorage keys)
      expect(parsed.state.accessToken).toBeUndefined();
      expect(parsed.state.refreshToken).toBeUndefined();
    }
  });
});
