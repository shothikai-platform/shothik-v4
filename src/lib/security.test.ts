import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './security';

describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const dirty = '<script>alert("xss")</script>Hello';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Hello');
  });

  it('should preserve span tags with data-reference attribute', () => {
    const html = '<span class="reference-link" data-reference="1">[1]</span>';
    const clean = sanitizeHtml(html);
    expect(clean).toBe(html);
  });

  it('should preserve anchor tags with target attribute', () => {
    const html = '<a href="https://example.com" target="_blank">Link</a>';
    const clean = sanitizeHtml(html);
    expect(clean).toContain('target="_blank"');
    expect(clean).toContain('href="https://example.com"');
  });

  it('should remove onclick handlers', () => {
      const html = '<button onclick="alert(1)">Click me</button>';
      const clean = sanitizeHtml(html);
      expect(clean).not.toContain('onclick');
      expect(clean).toContain('Click me');
  });
});
