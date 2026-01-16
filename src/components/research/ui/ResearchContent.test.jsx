
import { describe, it, expect } from 'vitest';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';

// Setup DOMPurify for Node environment (Vitest)
// isomorphic-dompurify handles window creation automatically if not provided,
// but for testing specific behaviors we can still rely on its sanitization.
const purify = DOMPurify;

describe('ResearchContent XSS Prevention', () => {
  it('should sanitize script tags from marked output', () => {
    const maliciousInput = 'Hello <script>alert("XSS")</script>';
    const markedOutput = marked(maliciousInput);
    const sanitized = purify.sanitize(markedOutput);

    expect(markedOutput).toContain('<script>');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Hello');
  });

  it('should sanitize img onerror attributes', () => {
    const maliciousInput = 'Image <img src=x onerror=alert(1)>';
    const markedOutput = marked(maliciousInput);
    const sanitized = purify.sanitize(markedOutput);

    expect(markedOutput).toContain('onerror');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).toContain('<img');
  });

  it('should preserve legitimate links and target attributes if configured', () => {
    const validLink = '[Link](https://example.com)';
    const markedOutput = marked(validLink);
    // marked renders: <a href="https://example.com">Link</a>
    // We might want to ensure target="_blank" is allowed if we add it manually or via renderer

    const sanitized = purify.sanitize(markedOutput, { ADD_ATTR: ['target'] });
    expect(sanitized).toContain('href="https://example.com"');
  });
});

describe('ResearchContentWithReferences Attributes', () => {
  it('should preserve data-reference attributes used for interactivity', () => {
    const input = '<span class="reference-link" data-reference="1">[1]</span>';
    // By default DOMPurify might strip data- attributes unless configured or if they are considered safe in newer versions (test seemed to imply it kept it?)
    // Let's force explicit configuration to be safe and clear.

    const sanitized = purify.sanitize(input, { ADD_ATTR: ['data-reference'] });
    expect(sanitized).toContain('data-reference="1"');
    expect(sanitized).toContain('class="reference-link"');
  });
});
