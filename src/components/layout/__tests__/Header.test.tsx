import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';
import { render } from '@/test/utils/test-utils';
import { useAuthStore } from '@/store/authStore';
import { act } from '@testing-library/react';

describe('Header', () => {
  beforeEach(() => {
    // Reset auth store
    act(() => {
      useAuthStore.setState({
        accessToken: null,
        refreshToken: null,
        user: null,
        isLoading: false,
        error: null,
      });
    });
  });

  it('should display user info when authenticated', () => {
    act(() => {
      useAuthStore.setState({
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        },
      });
    });

    render(<Header />);

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('(admin)')).toBeInTheDocument();
  });

  it('should not show user info when user is null', () => {
    render(<Header />);

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
    expect(screen.queryByText('(admin)')).not.toBeInTheDocument();
  });

  it('should show logout button', () => {
    render(<Header />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('should call logout when logout button clicked', async () => {
    const user = userEvent.setup();
    const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');

    render(<Header />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it('should display Job Scanner title', () => {
    render(<Header />);

    expect(screen.getByText('Job Scanner')).toBeInTheDocument();
    expect(screen.getByText('Find and track job opportunities')).toBeInTheDocument();
  });

  it('should render without crashing when user is null', () => {
    expect(() => render(<Header />)).not.toThrow();
  });
});
