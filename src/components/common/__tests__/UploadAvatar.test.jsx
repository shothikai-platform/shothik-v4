import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import UploadAvatar from '../UploadAvatar';

afterEach(() => {
  cleanup();
});

// Mock Image component
vi.mock('next/image', () => ({
  default: (props) => <img {...props} />
}));

describe('UploadAvatar Accessibility', () => {
  it('renders input with sr-only class for accessibility', () => {
    render(<UploadAvatar onDrop={vi.fn()} />);
    const input = screen.getByLabelText('Upload photo');
    expect(input).toBeDefined();
    expect(input.className).toContain('sr-only');
  });

  it('renders a wrapper label', () => {
    render(<UploadAvatar onDrop={vi.fn()} />);
    const input = screen.getByLabelText('Upload photo');
    // Ensure the input has an id and there's a corresponding label
    const labelId = input.id;
    const labels = document.getElementsByTagName('label');
    let hasMatchingLabel = false;
    for (let i = 0; i < labels.length; i++) {
        if (labels[i].htmlFor === labelId) {
            hasMatchingLabel = true;
            break;
        }
    }
    expect(hasMatchingLabel).toBe(true);
  });
});
