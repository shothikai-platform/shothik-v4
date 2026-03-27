import React from 'react';
import { render, screen } from '@testing-library/react';
import ResearchContentWithReferences from '../ResearchContentWithReferences';
import { describe, it, expect, vi } from 'vitest';

// Mock child components
vi.mock('../CombinedActions', () => ({
  default: () => <div data-testid="combined-actions" />
}));

vi.mock('../SourcesGrid', () => ({
  default: () => <div data-testid="sources-grid" />
}));

vi.mock('../ReferenceModal', () => ({
  default: () => <div data-testid="reference-modal" />
}));

describe('ResearchContentWithReferences Security', () => {
  it('should sanitize malicious content', () => {
    // Try a block-level HTML injection
    const maliciousContent = '<div><img src=x onerror=alert("XSS")></div>';
    const { container } = render(
        <ResearchContentWithReferences
            content={maliciousContent}
            sources={[]}
            isLastData={true}
        />
    );

    const proseDiv = container.querySelector('.prose');
    console.log('Rendered HTML:', proseDiv.innerHTML);

    // If vulnerable, it will contain <img ...> (unescaped)
    // If safe, it should be sanitized (removed) or escaped.
    expect(proseDiv.innerHTML).not.toContain('onerror=alert("XSS")');
  });
});
