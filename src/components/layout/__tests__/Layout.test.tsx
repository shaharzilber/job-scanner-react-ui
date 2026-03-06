import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Layout } from '../Layout';
import { render } from '@/test/utils/test-utils';

describe('Layout', () => {
  it('should render children inside layout div', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply correct CSS classes', () => {
    const { container } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass('min-h-screen');
    expect(layoutDiv).toHaveClass('bg-gray-50');
  });

  it('should render without crashing', () => {
    expect(() =>
      render(
        <Layout>
          <div>Test</div>
        </Layout>
      )
    ).not.toThrow();
  });

  it('should render multiple children', () => {
    render(
      <Layout>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </Layout>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });
});
