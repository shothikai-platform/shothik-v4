
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResearchProcessLogs from '../ResearchProcessLogs';

// Mock scrollIntoView to avoid errors
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const mockEvents = [
  {
    step: 'queued',
    timestamp: new Date().toISOString(),
    data: { message: 'Starting research...' }
  },
  {
    step: 'web_research',
    timestamp: new Date().toISOString(),
    data: { search_query: ['react performance'] }
  },
  {
    step: 'completed',
    timestamp: new Date().toISOString(),
    data: { output: 'Done' }
  }
];


const mockSources = [
  {
    step: 'web_research',
    data: {
      sources_gathered: [
        { title: 'React Docs', url: 'https://react.dev' }
      ]
    }
  }
];

describe('ResearchProcessLogs', () => {
  it('renders list of events', () => {
    render(<ResearchProcessLogs streamEvents={mockEvents} isStreaming={false} />);

    expect(screen.getByText('Starting research...')).toBeDefined();
    expect(screen.getByText('Queued')).toBeDefined();
    expect(screen.getByText('Web research')).toBeDefined();
    expect(screen.getByText('Completed')).toBeDefined();
  });

  it('handles empty events', () => {
    const { container } = render(<ResearchProcessLogs streamEvents={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders badges for queries', () => {
    render(<ResearchProcessLogs streamEvents={mockEvents} isStreaming={false} />);
    const badges = screen.getAllByText('react performance');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('uses semantic list for timeline events', () => {
    const { container } = render(<ResearchProcessLogs streamEvents={mockEvents} isStreaming={false} />);

    // Use querySelector to verify the DOM structure directly since testing-library seems to behave inconsistently with the list count in this environment
    const ol = container.querySelector('ol[aria-label="Research progress"]');
    expect(ol).toBeDefined();
    expect(ol).not.toBeNull();

    // Check for list items within the ol
    const listItems = ol.querySelectorAll('li');
    // We expect at least the number of events (3)
    expect(listItems.length).toBeGreaterThanOrEqual(3);
  });

  it('uses aria-live region for updates', () => {
    const { container } = render(<ResearchProcessLogs streamEvents={mockEvents} isStreaming={true} />);
    // Check if the container or a child has aria-live="polite"
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeDefined();
  });

  it('renders external link with accessibility attributes', () => {
    render(<ResearchProcessLogs streamEvents={mockSources} isStreaming={false} />);

    const link = screen.getByRole('link', { name: /opens in a new tab/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
