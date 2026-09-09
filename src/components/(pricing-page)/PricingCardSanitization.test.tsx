import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import DOMPurify from 'dompurify';

// Unit test verifying DOMPurify sanitization behavior for package content HTML
describe('PricingCard package content HTML sanitization', () => {
  it('strips dangerous script tags and event handlers from HTML content', () => {
    const maliciousHtml = '<p>Package description</p><script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const sanitizedHtml = DOMPurify.sanitize(maliciousHtml);

    expect(sanitizedHtml).not.toContain('<script>');
    expect(sanitizedHtml).not.toContain('onerror');
    expect(sanitizedHtml).toContain('<p>Package description</p>');
  });

  it('preserves valid safe formatting tags', () => {
    const safeHtml = '<p>Includes <strong>unlimited</strong> features &amp; support.</p>';
    const sanitizedHtml = DOMPurify.sanitize(safeHtml);

    expect(sanitizedHtml).toBe(safeHtml);
  });
});
