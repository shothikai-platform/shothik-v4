import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './security';

describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const input = '<div><script>alert(1)</script>Hello</div>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<div>Hello</div>');
  });

  it('should preserve allowed tags like span', () => {
    const input = '<span>Hello</span>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<span>Hello</span>');
  });

  it('should preserve allowed attributes like data-reference', () => {
    const input = '<span data-reference="1" class="ref">Ref</span>';
    const output = sanitizeHtml(input);
    expect(output).toContain('data-reference="1"');
    expect(output).toContain('class="ref"');
  });

  it('should allow target attribute on links', () => {
    const input = '<a href="https://example.com" target="_blank">Link</a>';
    const output = sanitizeHtml(input);
    expect(output).toContain('target="_blank"');
    expect(output).toContain('href="https://example.com"');
  });

  it('should remove event handlers', () => {
    const input = '<img src="x" onerror="alert(1)" />';
    const output = sanitizeHtml(input);
    expect(output).not.toContain('onerror');
    expect(output).toContain('img');
  });

  it('should handle complex nesting', () => {
      const input = '<div><p>Test <span data-reference="123">Ref</span></p><script>bad()</script></div>';
      const output = sanitizeHtml(input);
      expect(output).toContain('<span data-reference="123">Ref</span>');
      expect(output).not.toContain('<script>');
  });
});
