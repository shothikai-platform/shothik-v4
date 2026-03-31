import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import UploadAvatar from '../UploadAvatar';

vi.mock('next/image', () => ({ default: (props) => <img {...props} /> }));

describe('UploadAvatar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    render(<UploadAvatar onDrop={vi.fn()} />);
    expect(screen.getByText('Upload Photo')).toBeDefined();
  });

  it('is accessible via keyboard', () => {
    render(<UploadAvatar onDrop={vi.fn()} />);
    const fileInput = screen.getByLabelText('Upload Photo', { selector: 'input' });
    expect(fileInput.classList.contains('sr-only')).toBe(true);
  });
});
