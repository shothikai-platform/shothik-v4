import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResearchContentWithReferences from '../ResearchContentWithReferences';
import { marked } from 'marked';

// Mock marked
vi.mock('marked', () => {
  const markedFn = vi.fn((text) => `Parsed: ${text}`);
  markedFn.setOptions = vi.fn();
  return { marked: markedFn };
});

// Mock child components
vi.mock('../CombinedActions', () => ({
  default: () => <div data-testid="combined-actions">Actions</div>
}));
vi.mock('../ReferenceModal', () => ({
  default: () => <div data-testid="reference-modal">Modal</div>
}));
vi.mock('../SourcesGrid', () => ({
  default: () => <div data-testid="sources-grid">Sources</div>
}));
vi.mock('@/lib/utils', () => ({
  cn: (...args) => args.join(' '),
}));

describe('ResearchContentWithReferences Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should optimize marked calls via memoization', () => {
    const props = {
      content: 'Test content',
      sources: [],
      title: 'Title',
    };

    const { rerender } = render(<ResearchContentWithReferences {...props} />);

    // First render calls marked
    expect(marked).toHaveBeenCalledTimes(1);

    // Re-render with same props
    rerender(<ResearchContentWithReferences {...props} />);

    // With optimization, marked is NOT called again
    expect(marked).toHaveBeenCalledTimes(1);

    // Update props
    rerender(<ResearchContentWithReferences {...props} content="New content" />);

    // Now it should be called again
    expect(marked).toHaveBeenCalledTimes(2);
  });
});
