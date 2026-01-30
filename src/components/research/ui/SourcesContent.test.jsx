import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SourcesContent from './SourcesContent';

describe('SourcesContent', () => {
  const mockSources = [
    {
      title: 'Test Source 1',
      url: 'https://example.com/source1',
    },
    {
      title: 'Test Source 2',
      url: 'https://example.org/source2',
    },
  ];

  it('renders "No Sources Available" when empty', () => {
    render(<SourcesContent sources={[]} />);
    expect(screen.getByText(/No Sources Available/i)).toBeTruthy();
  });

  it('renders source cards as accessible links', () => {
    render(<SourcesContent sources={mockSources} />);

    // In the enhanced version, we expect <a> tags
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);

    expect(links[0].getAttribute('href')).toBe('https://example.com/source1');
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
    expect(links[0].getAttribute('aria-label')).toContain('Test Source 1');

    expect(screen.getByText('Test Source 1')).toBeTruthy();
    expect(screen.getByText('Test Source 2')).toBeTruthy();
  });
});
