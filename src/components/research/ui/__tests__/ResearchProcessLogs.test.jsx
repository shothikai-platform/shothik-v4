import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResearchProcessLogs from '../ResearchProcessLogs';

describe('ResearchProcessLogs', () => {
  const mockStreamEvents = [
    {
      step: 'queued',
      timestamp: Date.now() - 5000,
      data: { message: 'Starting research...' }
    },
    {
      step: 'generate_query',
      timestamp: Date.now() - 4000,
      data: { search_query: ['react performance', 'react memo'] }
    },
    {
      step: 'web_research',
      timestamp: Date.now() - 3000,
      data: { sources_gathered: [
        { url: 'https://react.dev', title: 'React' },
        { url: 'https://react.dev/blog', title: 'React Blog' }
      ] }
    },
    {
      step: 'reflection',
      timestamp: Date.now() - 2000,
      data: { message: 'Analyzing sources...' }
    }
  ];

  it('renders correct number of steps', () => {
    render(<ResearchProcessLogs streamEvents={mockStreamEvents} isStreaming={true} />);

    // Check for step labels - getByText throws if not found
    expect(screen.getByText('Queued')).toBeDefined();
    expect(screen.getByText('Query generation')).toBeDefined();
    expect(screen.getByText('Web research')).toBeDefined();
    expect(screen.getByText('Analysis & reflection')).toBeDefined();
  });

  it('renders sources correctly', () => {
    render(<ResearchProcessLogs streamEvents={mockStreamEvents} isStreaming={true} />);

    // Check for source title - might appear multiple times (summary + step)
    const sources = screen.getAllByText('React');
    expect(sources.length).toBeGreaterThan(0);

    // Check for source count badge in summary
    // "2 sources" should appear in summary and possibly in step badge
    const badges = screen.getAllByText('2 sources');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('renders search queries correctly', () => {
    render(<ResearchProcessLogs streamEvents={mockStreamEvents} isStreaming={true} />);

    const queries1 = screen.getAllByText('react performance');
    expect(queries1.length).toBeGreaterThan(0);

    const queries2 = screen.getAllByText('react memo');
    expect(queries2.length).toBeGreaterThan(0);
  });
});
