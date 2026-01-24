import React from 'react';
import { render, screen } from '@testing-library/react';
import ResearchContent from '../ResearchContent';
import { describe, it, expect, vi } from 'vitest';

// Mock Redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

// Mock ResearchContentWithReferences to simplify testing (we test it separately)
vi.mock('../../tools/research/ResearchContentWithReferences', () => ({
  default: () => <div data-testid="research-content-with-references" />
}));

describe('ResearchContent Security', () => {
  it('should sanitize malicious content in MessageBubble', () => {
    // We pass hasSources = false implicitly by providing sources: []
    const maliciousContent = '<div><img src=x onerror=alert("XSS")></div>';

    const props = {
      currentResearch: {
        result: maliciousContent,
        sources: []
      },
      isLastData: true
    };

    const { container } = render(<ResearchContent {...props} />);

    // Check if MessageBubble is rendered
    // MessageBubble renders a div with class 'prose'
    const proseDiv = container.querySelector('.prose');

    // If we are in MessageBubble branch, proseDiv should exist.
    expect(proseDiv).not.toBeNull();

    // Check sanitization
    // If vulnerable, it would contain onerror=alert("XSS") (assuming marked preserves it as block html)
    // If sanitized, it should be stripped.
    expect(proseDiv.innerHTML).not.toContain('onerror=alert("XSS")');
    expect(proseDiv.innerHTML).toContain('<img src="x">'); // Should keep safe tags
  });
});
