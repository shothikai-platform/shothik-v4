import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SourcesContent from '../SourcesContent';

describe('SourcesContent', () => {
  const mockSources = [
    {
      title: 'Test Source 1',
      url: 'https://example.com/1',
      reference: 1,
    },
    {
      title: 'Test Source 2',
      url: 'https://example.com/2',
      reference: 2,
    },
  ];

  it('renders source links with correct attributes', () => {
    render(<SourcesContent sources={mockSources} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);

    expect(links[0].getAttribute('href')).toBe('https://example.com/1');
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');

    expect(links[1].getAttribute('href')).toBe('https://example.com/2');
  });

  it('renders empty state correctly', () => {
    render(<SourcesContent sources={[]} />);
    expect(screen.getByText('No Sources Available')).not.toBeNull();
  });
});
