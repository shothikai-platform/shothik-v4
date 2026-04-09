import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './security';

describe('sanitizeHtml', () => {
  it('should strip script tags', () => {
    const input = '<p>Hello <script>alert("xss")</script>World</p>';
    const output = sanitizeHtml(input);
    // DOMPurify might return different structure depending on how it parses
    // but definitely no script
    expect(output).not.toContain('<script>');
    expect(output).toContain('Hello ');
    expect(output).toContain('World');
  });

  it('should preserve allowed tags and attributes', () => {
    const input = '<p class="text-red">Hello <b>World</b></p>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<p class="text-red">Hello <b>World</b></p>');
  });

  it('should allow data-reference attribute on span', () => {
    const input = '<span class="reference-link" data-reference="1">[1]</span>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<span class="reference-link" data-reference="1">[1]</span>');
  });

  it('should allow target attribute on a', () => {
    const input = '<a href="https://example.com" target="_blank">Link</a>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<a href="https://example.com" target="_blank">Link</a>');
  });

  it('should remove disallowed attributes', () => {
    const input = '<p onclick="alert(1)">Click me</p>';
    const output = sanitizeHtml(input);
    expect(output).toBe('<p>Click me</p>');
  });

  it('should remove disallowed tags', () => {
    const input = '<object data="malicious.swf"></object>';
    const output = sanitizeHtml(input);
    expect(output).toBe('');
  });
});
