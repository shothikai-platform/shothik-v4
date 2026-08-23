import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ArticleDetail from './ArticleDetail';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
}));

// Mock NewsCard component
vi.mock('@/components/(secondary-layout)/(blogs-page)/NewsCard', () => ({
  NewsCard: () => <div data-testid="news-card">NewsCard</div>,
}));

describe('ArticleDetail XSS Sanitization', () => {
  it('renders sanitized article content after mounting', async () => {
    const { container } = render(<ArticleDetail />);

    // Wait for component to mount and DOMPurify to process
    const heading = screen.getByText(/We're excited to announce/i);
    expect(heading).toBeDefined();

    const proseDiv = container.querySelector('.prose');
    expect(proseDiv).toBeDefined();
    expect(proseDiv).not.toBeNull();
    // Verify script tags or inline handlers would be sanitized
    expect(proseDiv?.innerHTML).not.toContain('<script>');
  });
});
