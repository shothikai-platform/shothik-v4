import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SourcesContent from '../SourcesContent';

// Mock UI components to simplify testing
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }) => <div data-testid="avatar" className={className}>{children}</div>,
  AvatarFallback: ({ children }) => <div data-testid="avatar-fallback">{children}</div>,
  AvatarImage: ({ src }) => <img data-testid="avatar-image" src={src} alt="" />,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }) => (
    <div data-testid="card" className={className} onClick={onClick}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }) => <div data-testid="card-content" className={className}>{children}</div>,
}));

describe('SourcesContent', () => {
  afterEach(() => {
    cleanup();
  });

  const mockSources = [
    {
      title: 'React Performance',
      url: 'https://react.dev/learn/render-and-commit',
    },
    {
      title: 'Web Vitals',
      url: 'https://web.dev/vitals/',
    },
  ];

  it('renders a list of sources', () => {
    render(<SourcesContent sources={mockSources} />);

    expect(screen.getByText('React Performance')).toBeDefined();
    expect(screen.getByText('Web Vitals')).toBeDefined();
    expect(screen.getAllByTestId('card')).toHaveLength(2);
  });

  it('renders empty state when no sources are provided', () => {
    render(<SourcesContent sources={[]} />);
    expect(screen.getByText('No Sources Available')).toBeDefined();
  });

  it('opens source URL in new tab on click', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => {});
    render(<SourcesContent sources={mockSources} />);

    const card = screen.getByText('React Performance').closest('[data-testid="card"]');
    fireEvent.click(card);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://react.dev/learn/render-and-commit',
      '_blank',
      'noopener,noreferrer'
    );
    windowOpenSpy.mockRestore();
  });
});
