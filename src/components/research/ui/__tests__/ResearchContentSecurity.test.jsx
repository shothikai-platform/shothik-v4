import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { describe, it, expect } from 'vitest';

describe('ResearchContent Security Check', () => {
  it('should be vulnerable to XSS with marked only', () => {
    const malicious = '<script>alert("XSS")</script>';
    // marked returns a string or promise depending on async option, but usually synchronous string
    const html = marked.parse(malicious);
    // marked < 4.0 returns string, >= 4.0 might return promise if async is true (default false)
    expect(html).toContain('<script>alert("XSS")</script>');
  });

  it('should be sanitized by DOMPurify', () => {
    const malicious = '<script>alert("XSS")</script>';
    const html = marked.parse(malicious);
    const sanitized = DOMPurify.sanitize(html);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('');
  });

  it('should preserve reference spans with DOMPurify config', () => {
    // This simulates what ResearchContentWithReferences does:
    // It creates a string with span tags, then passes it to marked.
    const content = 'Some text <span class="reference-link" data-reference="1">[1]</span>';
    const html = marked.parse(content);

    // With correct config
    const sanitizedCustom = DOMPurify.sanitize(html, {
      ADD_ATTR: ['data-reference', 'target']
    });

    expect(sanitizedCustom).toContain('data-reference="1"');
    expect(sanitizedCustom).toContain('class="reference-link"');
    expect(sanitizedCustom).toContain('Some text');
  });

  it('should sanitize mixed content (valid spans + malicious script)', () => {
    const content = 'Safe <span class="reference-link" data-reference="1">[1]</span> <script>alert(1)</script>';
    const html = marked.parse(content);

    const sanitized = DOMPurify.sanitize(html, {
      ADD_ATTR: ['data-reference', 'target']
    });

    expect(sanitized).toContain('data-reference="1"');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Safe');
  });
});
