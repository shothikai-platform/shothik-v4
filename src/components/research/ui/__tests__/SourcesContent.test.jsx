import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SourcesContent from '../SourcesContent';

describe('SourcesContent', () => {
  it('renders source links correctly', () => {
    const sources = [
      {
        url: 'https://example.com/source1',
        title: 'Source 1',
      },
      {
        url: 'https://test.com/source2',
        title: 'Source 2',
      },
    ];

    render(<SourcesContent sources={sources} />);

    const link1 = screen.getByRole('link', { name: /Source 1/i });
    expect(link1).toBeTruthy();
    expect(link1.getAttribute('href')).toBe('https://example.com/source1');
    expect(link1.getAttribute('target')).toBe('_blank');
    expect(link1.getAttribute('rel')).toContain('noopener');
    expect(link1.getAttribute('rel')).toContain('noreferrer');

    const link2 = screen.getByRole('link', { name: /Source 2/i });
    expect(link2).toBeTruthy();
    expect(link2.getAttribute('href')).toBe('https://test.com/source2');
  });

  it('renders empty state when no sources', () => {
    render(<SourcesContent sources={[]} />);
    expect(screen.getByText(/No Sources Available/i)).toBeTruthy();
  });
});
