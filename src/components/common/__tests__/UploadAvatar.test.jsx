import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import UploadAvatar from '../UploadAvatar';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />
}));

describe('UploadAvatar', () => {
  it('renders upload prompt', () => {
    render(<UploadAvatar onDrop={vi.fn()} />);
    expect(screen.getByText('Upload Photo')).not.toBeNull();
  });

  it('is accessible via label', () => {
    render(<UploadAvatar onDrop={vi.fn()} />);
    // This should fail for the current implementation because the input is hidden
    // and not associated with the text "Upload Photo" via a label element.
    const input = screen.getByLabelText(/upload photo/i);
    expect(input).not.toBeNull();
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('file');
  });

  it('calls onDrop when file is selected via input', () => {
    const handleDrop = vi.fn();
    render(<UploadAvatar onDrop={handleDrop} />);

    // This will also fail if getByLabelText fails.
    const input = screen.getByLabelText(/upload photo/i);

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(handleDrop).toHaveBeenCalledTimes(1);
    expect(handleDrop).toHaveBeenCalledWith(file);
  });
});
