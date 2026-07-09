import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SharedContentPage from './page';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ contentType: 'research', shareId: 'test-id' }),
}));

// Mock Spinner
vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

describe('SharedContentPage XSS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    // Mock fetch to prevent actual network calls
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404
      })
    );
  });

  it('should sanitize content.content in renderResearchContent', async () => {
    const maliciousContent = '<img src=x onerror="alert(1)">';
    const demoData = {
      shareId: 'test-id',
      contentType: 'research',
      content: {
        title: 'XSS Test',
        content: maliciousContent,
      },
      permissions: { isPublic: true, allowDownload: true },
      currentViews: 0,
      createdAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem('share_test-id', JSON.stringify(demoData));

    render(<SharedContentPage />);

    // Wait for loading to finish
    const contentContainer = await screen.findByText('XSS Test');
    expect(contentContainer).toBeDefined();

    // Check if the malicious script is present in the DOM
    const html = document.body.innerHTML;

    // It should NOT contain the onerror attribute
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('alert(1)');

    // It SHOULD contain the image tag (sanitized)
    // We use a regex to be more flexible with quotes/spacing
    expect(html).toMatch(/<img[^>]+src=["']x["'][^>]*>/);
  });
});
