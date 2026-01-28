import { render } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ResearchProcessLogs from '../ResearchProcessLogs';
import ProcessTimelineItem from '../ProcessTimelineItem';

// Mock the child component to track renders
// We must memoize the mock to simulate the real component's behavior
vi.mock('../ProcessTimelineItem', async () => {
  const React = await import('react');
  const { vi } = await import('vitest');

  // The spy function
  const MockImplementation = vi.fn(({ ev }) => <div data-testid="timeline-item">{ev.step}</div>);

  // The memoized wrapper
  const MemoizedMock = React.memo(MockImplementation);

  // Attach spy to the wrapper so we can access it in tests
  MemoizedMock.mock = MockImplementation;

  return {
    default: MemoizedMock,
  };
});

// Mock UI components
vi.mock('@/components/ui/badge', () => ({ Badge: ({ children }) => <div>{children}</div> }));
vi.mock('@/components/ui/card', () => ({ Card: ({ children }) => <div>{children}</div>, CardContent: ({ children }) => <div>{children}</div> }));
vi.mock('@/components/ui/separator', () => ({ Separator: () => <hr /> }));
vi.mock('@/lib/utils', () => ({ cn: (...args) => args.join(' ') }));

describe('ResearchProcessLogs Performance', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not re-render unchanged items when new items are appended', () => {
    const event1 = { step: 'step1', timestamp: 1, data: { title: 'T1' } };
    const event2 = { step: 'step2', timestamp: 2, data: { title: 'T2' } };
    const event3 = { step: 'step3', timestamp: 3, data: { title: 'T3' } };

    // Initial Render: [event1]
    const { rerender } = render(
      <ResearchProcessLogs streamEvents={[event1]} isStreaming={true} />
    );

    // Expect: Item 0 renders
    // We check the attached mock spy
    expect(ProcessTimelineItem.mock).toHaveBeenCalledTimes(1);
    vi.clearAllMocks();

    // Second Render: [event1, event2]
    rerender(
      <ResearchProcessLogs streamEvents={[event1, event2]} isStreaming={true} />
    );

    // Active index changes. Item 0 props change. Item 1 is new.
    // Expect: 2 renders.
    expect(ProcessTimelineItem.mock).toHaveBeenCalledTimes(2);
    vi.clearAllMocks();

    // Third Render: [event1, event2, event3]
    rerender(
      <ResearchProcessLogs streamEvents={[event1, event2, event3]} isStreaming={true} />
    );

    // Active index changes.
    // Item 0: unchanged props -> SHOULD NOT RENDER.
    // Item 1: props changed -> renders.
    // Item 2: new -> renders.
    // Expect: 2 renders.
    expect(ProcessTimelineItem.mock).toHaveBeenCalledTimes(2);
  });
});
