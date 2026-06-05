import { describe, it, expect } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';

describe('Blog Sanitization with isomorphic-dompurify', () => {
  it('should remove malicious scripts from HTML (simulating client/server)', () => {
    const maliciousHtml = '<p>Hello</p><script>alert("xss")</script><img src="x" onerror="alert(1)">';

    // isomorphic-dompurify works out of the box in both environments
    const sanitizedHtml = DOMPurify.sanitize(maliciousHtml);

    expect(sanitizedHtml).not.toContain('<script>');
    expect(sanitizedHtml).not.toContain('onerror');
    expect(sanitizedHtml).toContain('<p>Hello</p>');
    expect(sanitizedHtml).toContain('<img src="x">');
  });

  it('should preserve safe HTML tags', () => {
    const safeHtml = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> and <em>italics</em>.</p><ul><li>Item 1</li></ul>';

    const sanitizedHtml = DOMPurify.sanitize(safeHtml);

    // Some minor variations in output might occur depending on DOMPurify version/config (e.g. self-closing tags)
    // but the core structure should remain.
    expect(sanitizedHtml).toContain('<h1>Title</h1>');
    expect(sanitizedHtml).toContain('<p>Paragraph with <strong>bold</strong> and <em>italics</em>.</p>');
    expect(sanitizedHtml).toContain('<ul><li>Item 1</li></ul>');
  });
});
