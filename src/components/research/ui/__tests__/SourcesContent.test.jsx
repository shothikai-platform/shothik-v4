import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SourcesContent from '../SourcesContent';

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }) => (
    <div data-testid="card" className={className} onClick={onClick}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }) => <div className={className}>{children}</div>,
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }) => <div className={className}>{children}</div>,
  AvatarImage: ({ src }) => <img src={src} alt="" />,
  AvatarFallback: ({ children, className }) => <div className={className}>{children}</div>,
}));

describe('SourcesContent', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders sources correctly', () => {
    const sources = [
      { title: 'Example Source 1', url: 'https://example.com/article1' },
      { title: 'Example Source 2', url: 'https://test.com/article2' },
    ];

    render(<SourcesContent sources={sources} />);

    expect(screen.getByText('Example Source 1')).toBeTruthy();
    expect(screen.getByText('Example Source 2')).toBeTruthy();
    // Based on current implementation, it renders the domain
    expect(screen.getByText('example.com')).toBeTruthy();
    expect(screen.getByText('test.com')).toBeTruthy();
  });

  it('renders "No Sources Available" when empty', () => {
    render(<SourcesContent sources={[]} />);
    expect(screen.getByText('No Sources Available')).toBeTruthy();
  });

  it('handles invalid URLs gracefully', () => {
    const sources = [{ title: 'Invalid URL', url: 'not-a-url' }];
    render(<SourcesContent sources={sources} />);
    expect(screen.getByText('Invalid URL')).toBeTruthy();
    // It should render the raw URL if parsing fails (based on catch block in current code)
    expect(screen.getByText('not-a-url')).toBeTruthy();
  });

  it('renders sources as links', () => {
    const sources = [{ title: 'Link Source', url: 'https://link.com' }];
    render(<SourcesContent sources={sources} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('https://link.com');
    expect(link.getAttribute('target')).toBe('_blank');
  });
});
