import { describe, it, expect } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';

describe('Blog Content Sanitization', () => {
  it('should strip malicious script tags', () => {
    const maliciousHtml = '<p>Safe content</p><script>alert("XSS")</script>';
    const sanitizedHtml = DOMPurify.sanitize(maliciousHtml);

    expect(sanitizedHtml).toBe('<p>Safe content</p>');
    expect(sanitizedHtml).not.toContain('<script>');
  });

  it('should strip event handler attributes', () => {
    const maliciousHtml = '<img src="x" onerror="alert(1)">';
    const sanitizedHtml = DOMPurify.sanitize(maliciousHtml);

    expect(sanitizedHtml).toBe('<img src="x">');
    expect(sanitizedHtml).not.toContain('onerror');
  });

  it('should strip javascript: pseudoprotocols', () => {
    const maliciousHtml = '<a href="javascript:alert(1)">Click me</a>';
    const sanitizedHtml = DOMPurify.sanitize(maliciousHtml);

    expect(sanitizedHtml).toBe('<a>Click me</a>');
    expect(sanitizedHtml).not.toContain('javascript:');
  });

  it('should preserve safe HTML elements and attributes', () => {
    const safeHtml = '<h1>Title</h1><p>This is a <strong>safe</strong> paragraph.</p><a href="https://example.com">Link</a>';
    const sanitizedHtml = DOMPurify.sanitize(safeHtml);

    expect(sanitizedHtml).toBe(safeHtml);
  });

  it('should handle complex nested malicious content', () => {
    const maliciousHtml = '<div><p onmouseover="alert(1)">Hover me <script>console.log("bad")</script></p></div>';
    const sanitizedHtml = DOMPurify.sanitize(maliciousHtml);

    expect(sanitizedHtml).toBe('<div><p>Hover me </p></div>');
    expect(sanitizedHtml).not.toContain('onmouseover');
    expect(sanitizedHtml).not.toContain('<script>');
  });
});
