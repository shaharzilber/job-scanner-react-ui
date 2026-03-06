import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { JobsPage } from '../JobsPage';
import { render } from '@/test/utils/test-utils';

describe('JobsPage', () => {
  it('should render layout and header', () => {
    render(<JobsPage />);

    // Check that header elements are present
    expect(screen.getByText('Job Scanner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should display dashboard content', () => {
    render(<JobsPage />);

    expect(screen.getByText('Jobs Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to the Job Scanner!/i)).toBeInTheDocument();
    expect(screen.getByText(/React version of the application/i)).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    expect(() => render(<JobsPage />)).not.toThrow();
  });

  it('should show migration message', () => {
    render(<JobsPage />);

    expect(screen.getByText(/Components are being migrated from vanilla JS/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay tuned!/i)).toBeInTheDocument();
  });
});
