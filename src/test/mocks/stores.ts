import { act } from '@testing-library/react';
import { useAuthStore } from '@/store/authStore';
import { useJobStore } from '@/store/jobStore';
import { useScanStore } from '@/store/scanStore';

export const resetAllStores = () => {
  act(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      error: null,
    });
    useJobStore.setState({
      jobs: [],
      selectedJob: null,
      filters: { category: 'all', searchTerm: '', sortBy: 'recent' },
      activeTab: 'all',
      isLoading: false,
    });
    useScanStore.getState().reset();
  });
};

export const mockAuthenticatedUser = () => {
  act(() => {
    useAuthStore.setState({
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
      },
      isLoading: false,
      error: null,
    });
  });
};
