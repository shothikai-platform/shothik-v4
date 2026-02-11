import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import UploadAvatar from '../UploadAvatar';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props) => <img {...props} />,
}));

describe('UploadAvatar', () => {
  it('renders correctly', () => {
    render(<UploadAvatar />);
    expect(screen.getByText('Upload Photo')).not.toBeNull();
  });

  it('input is accessible (sr-only, not hidden)', () => {
    const { container } = render(<UploadAvatar />);
    const input = container.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    // Should verify it has sr-only class
    expect(input.className).toContain('sr-only');
    // Should verify it does NOT have hidden class
    expect(input.className).not.toContain('hidden');

    // Verify label association
    const label = container.querySelector('label');
    expect(label).not.toBeNull();
    expect(label.getAttribute('for')).toBe(input.id);
  });
});
