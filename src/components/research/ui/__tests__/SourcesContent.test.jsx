import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SourcesContent from '../SourcesContent';

// Mock components to simplify testing
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }) => <div data-testid="avatar" className={className}>{children}</div>,
  AvatarImage: ({ src }) => <img src={src} alt="" data-testid="avatar-image" />,
  AvatarFallback: ({ children }) => <div data-testid="avatar-fallback">{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }) => (
    <div data-testid="card" className={className} onClick={onClick}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }) => <div className={className}>{children}</div>,
}));

const mockSources = [
  {
    title: 'Test Source 1',
    url: 'https://example.com/article1',
  },
  {
    title: 'Test Source 2',
    url: 'https://test.org/page',
  },
];

describe('SourcesContent', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a list of sources', () => {
    render(<SourcesContent sources={mockSources} />);

    expect(screen.getByText('Test Source 1')).toBeDefined();
    expect(screen.getByText('Test Source 2')).toBeDefined();
    expect(screen.getAllByTestId('card')).toHaveLength(2);
  });

  it('renders empty state when no sources provided', () => {
    render(<SourcesContent sources={[]} />);
    expect(screen.getByText('No Sources Available')).toBeDefined();
  });

  it('opens link in new tab when card is clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});
    render(<SourcesContent sources={mockSources} />);

    const cards = screen.getAllByTestId('card');
    fireEvent.click(cards[0]);

    expect(openSpy).toHaveBeenCalledWith('https://example.com/article1', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('renders domain abbreviation correctly', () => {
    render(<SourcesContent sources={mockSources} />);
    // "example.com" -> "EX"
    // "test.org" -> "TE"
    expect(screen.getByText('EX')).toBeDefined();
    expect(screen.getByText('TE')).toBeDefined();
  });
});
