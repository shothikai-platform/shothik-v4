import { describe, it, expect } from 'vitest';
import { processContentWithReferences } from './ResearchContentWithReferences';

describe('processContentWithReferences', () => {
  it('should return text as is if no references', () => {
    const text = 'Hello world';
    const result = processContentWithReferences(text, []);
    expect(result).toBe(text);
  });

  it('should replace reference [1] with a span if source exists', () => {
    const text = 'Statement [1]';
    const sources = [{ reference: 1, title: 'Test' }];
    const result = processContentWithReferences(text, sources);

    // Check for span existence
    expect(result).toContain('<span class="reference-link');
    expect(result).toContain('data-reference="1"');
    expect(result).toContain('>[1]</span>');
  });

  it('should NOT replace reference [1] if source does not exist', () => {
    const text = 'Statement [1]';
    const sources = [{ reference: 2, title: 'Test' }];
    const result = processContentWithReferences(text, sources);

    expect(result).toBe('Statement [1]');
  });

  it('should handle multiple references [1, 2]', () => {
    const text = 'Statement [1, 2]';
    const sources = [
      { reference: 1, title: 'One' },
      { reference: 2, title: 'Two' }
    ];
    const result = processContentWithReferences(text, sources);

    expect(result).toContain('data-reference="1"');
    expect(result).toContain('data-reference="2"');
    expect(result).toContain('>[1]</span>');
    expect(result).toContain('>[2]</span>');
  });

  it('should handle mixed existing and non-existing references', () => {
    const text = 'Statement [1, 2]';
    const sources = [
      { reference: 1, title: 'One' }
    ];
    const result = processContentWithReferences(text, sources);

    expect(result).toContain('data-reference="1"');
    expect(result).not.toContain('data-reference="2"');
    expect(result).toContain('>[2]'); // Should remain as text (or part of the string)
  });
});
