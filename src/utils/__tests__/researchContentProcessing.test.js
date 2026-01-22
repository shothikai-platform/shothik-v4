
import { describe, it, expect } from 'vitest';
import { processResearchContent } from '../researchContentProcessing';

describe('processResearchContent', () => {
  it('should return the text as is if there are no references', () => {
    const content = 'This is a simple text.';
    const sources = [];
    const result = processResearchContent(content, sources);
    expect(result).toBe(content);
  });

  it('should process references when sources exist', () => {
    const content = 'This is a statement [1].';
    const sources = [{ reference: 1, title: 'Source 1', url: 'http://example.com' }];
    const result = processResearchContent(content, sources);

    expect(result).toContain('<span class="reference-link');
    expect(result).toContain('data-reference="1"');
    expect(result).toContain('>[1]</span>');
  });

  it('should ignore references that do not exist in sources', () => {
    const content = 'This is a statement [99].';
    const sources = [{ reference: 1 }];
    const result = processResearchContent(content, sources);

    expect(result).toBe('This is a statement [99].');
    expect(result).not.toContain('<span class="reference-link');
  });

  it('should handle multiple references in one bracket', () => {
    const content = 'Statement [1, 2].';
    const sources = [
      { reference: 1 },
      { reference: 2 }
    ];
    const result = processResearchContent(content, sources);

    expect(result).toContain('>[1]</span>');
    expect(result).toContain('>[2]</span>');
  });

  it('should handle mixed existing and non-existing references', () => {
    const content = 'Statement [1, 99].';
    const sources = [{ reference: 1 }];
    const result = processResearchContent(content, sources);

    expect(result).toContain('>[1]</span>');
    expect(result).toContain('[99]');
    expect(result).not.toContain('>[99]</span>');
  });

  it('should handle object content input', () => {
    const content = { text: 'Statement [1].' };
    const sources = [{ reference: 1 }];
    const result = processResearchContent(content, sources);

    expect(result).toContain('>[1]</span>');
  });

  it('should handle empty input', () => {
    expect(processResearchContent(null, [])).toBe('');
    expect(processResearchContent(undefined, [])).toBe('');
    expect(processResearchContent({}, [])).toBe('');
  });
});
