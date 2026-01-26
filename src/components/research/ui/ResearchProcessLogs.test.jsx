import React from 'react';
import { render, screen } from '@testing-library/react';
import ResearchProcessLogs from './ResearchProcessLogs';
import { describe, it, expect } from 'vitest';

describe('ResearchProcessLogs', () => {
  const mockStreamEvents = [
    {
      step: 'queued',
      timestamp: new Date().toISOString(),
      data: { title: 'Test Research' }
    },
    {
      step: 'web_research',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Searching for info',
        search_query: ['query 1', 'query 2'],
        sources_gathered: [{ url: 'https://example.com', title: 'Example' }]
      }
    },
    {
      step: 'completed',
      timestamp: new Date().toISOString(),
      data: { output: 'Done' }
    }
  ];

  it('renders research logs with correct steps and info', () => {
    render(
      <ResearchProcessLogs
        streamEvents={mockStreamEvents}
        isStreaming={false}
      />
    );

    // Check if main title is rendered (might be multiple if also in log items)
    expect(screen.getAllByText('Test Research').length).toBeGreaterThan(0);

    // Check if steps are rendered
    expect(screen.getByText('Queued')).toBeDefined();
    expect(screen.getByText('Web research')).toBeDefined();
    expect(screen.getByText('Completed')).toBeDefined();

    // Check for message content
    expect(screen.getByText('Searching for info')).toBeDefined();

    // Check for badges (may appear in summary and items)
    expect(screen.getAllByText('query 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1 sources').length).toBeGreaterThan(0);
  });

  it('handles empty stream events gracefully', () => {
    const { container } = render(
      <ResearchProcessLogs
        streamEvents={[]}
        isStreaming={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
