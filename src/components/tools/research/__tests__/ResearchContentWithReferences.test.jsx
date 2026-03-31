import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';
import ResearchContentWithReferences from '../ResearchContentWithReferences';
import { marked } from 'marked';

// Mock dependencies
vi.mock('marked', () => {
  const markedFn = vi.fn((text) => `<div>Parsed: ${text}</div>`);
  // Add setOptions method to the mock function object
  markedFn.setOptions = vi.fn();
  return { marked: markedFn };
});

vi.mock('../CombinedActions', () => ({
  default: () => <div data-testid="combined-actions">Actions</div>,
}));
vi.mock('../ReferenceModal', () => ({
  default: () => <div data-testid="reference-modal">Modal</div>,
}));
vi.mock('../SourcesGrid', () => ({
  default: () => <div data-testid="sources-grid">Sources</div>,
}));

describe('ResearchContentWithReferences Performance', () => {
  it('should memoize markdown parsing when internal state changes', async () => {
    const content = 'Some research content with [1] reference.';
    const sources = [{ reference: 1, url: 'http://example.com' }];

    const { container } = render(
      <ResearchContentWithReferences
        content={content}
        sources={sources}
      />
    );

    // Initial render
    expect(marked).toHaveBeenCalledTimes(1);

    // Find the reference link (it should be processed)
    // processContentWithReferences converts [1] to a span with class 'reference-link'
    // marked wraps it in div (mock implementation)
    // dangerouslySetInnerHTML puts it in the DOM.

    const refLink = container.querySelector('.reference-link');
    expect(refLink).not.toBeNull();

    // Trigger hover to update state
    fireEvent.mouseOver(refLink);

    // We expect re-render due to state change (selectedReference, etc.)
    // Without memoization, marked should be called again.
    // We wait for potentially async updates or just assert immediately if synchronous.
    // State updates in event handlers are batched but usually result in re-render.

    // In React 18, automatic batching might happen, but we are inside an event handler.
    // Let's assume it re-renders.

    // To ensure re-render happened, we can check if the component actually reacted?
    // The component sets state, so it *must* re-render.

    // We check the call count.
    // If optimized, it should still be 1.
    // If not optimized, it should be > 1.

    // With optimization, marked should NOT be called again because content and sources didn't change.
    expect(marked).toHaveBeenCalledTimes(1);
  });
});
