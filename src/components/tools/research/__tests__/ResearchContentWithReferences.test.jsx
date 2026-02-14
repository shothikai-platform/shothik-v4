
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResearchContentWithReferences from '../ResearchContentWithReferences';
import { marked } from 'marked';

// Mock dependencies
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...inputs) => inputs.join(' ')),
}));

// Mock marked
vi.mock('marked', () => {
  const markedFn = vi.fn((text) => `<p>${text}</p>`);
  markedFn.setOptions = vi.fn();
  return { marked: markedFn };
});

vi.mock('../CombinedActions', () => ({
  default: () => <div data-testid="combined-actions">CombinedActions</div>,
}));

vi.mock('../ReferenceModal', () => ({
  default: () => <div data-testid="reference-modal">ReferenceModal</div>,
}));

vi.mock('../SourcesGrid', () => ({
  default: () => <div data-testid="sources-grid">SourcesGrid</div>,
}));

describe('ResearchContentWithReferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders content correctly and uses memoization', () => {
    const content = "Test content";
    const sources = [{ reference: 1, title: "Source 1" }];

    const { rerender } = render(
      <ResearchContentWithReferences
        content={content}
        sources={sources}
      />
    );

    expect(screen.getByTestId('combined-actions')).toBeTruthy();

    // Check initial render calls
    expect(marked).toHaveBeenCalledTimes(1);

    // Rerender with same props
    rerender(
      <ResearchContentWithReferences
        content={content}
        sources={sources}
      />
    );

    // Should NOT call marked again if memoized properly
    expect(marked).toHaveBeenCalledTimes(1);

    // Rerender with different content
    rerender(
      <ResearchContentWithReferences
        content="New content"
        sources={sources}
      />
    );

    // Should call marked again
    expect(marked).toHaveBeenCalledTimes(2);
  });
});
