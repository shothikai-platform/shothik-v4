import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UploadAvatar from '../UploadAvatar';

// Mock next/image since we are not in a Next.js environment
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Camera: (props) => <svg {...props} data-testid="camera-icon" />
}));

describe('UploadAvatar', () => {
  it('renders the upload placeholder correctly', () => {
    render(<UploadAvatar />);
    expect(screen.getByText('Upload Photo')).toBeDefined();
    expect(screen.getByTestId('camera-icon')).toBeDefined();
  });

  it('renders the helper text when provided', () => {
    render(<UploadAvatar helperText="Max size 2MB" />);
    expect(screen.getByText('Max size 2MB')).toBeDefined();
  });

  it('calls onDrop when a file is selected', () => {
    const handleDrop = vi.fn();
    const { container } = render(<UploadAvatar onDrop={handleDrop} />);
    const input = container.querySelector('input[type="file"]');

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(handleDrop).toHaveBeenCalledTimes(1);
    expect(handleDrop).toHaveBeenCalledWith(file);
  });

  it('displays the uploaded image when file prop is provided', () => {
    const fileUrl = 'https://example.com/avatar.png';
    render(<UploadAvatar file={fileUrl} />);
    const img = screen.getByAltText('avatar');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe(fileUrl);
  });

  it('renders visually hidden input for accessibility', () => {
    const { container } = render(<UploadAvatar />);
    const input = container.querySelector('input[type="file"]');

    expect(input.className).toContain('sr-only');
    expect(input.className).not.toContain('hidden');
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('associates helper text with input via aria-describedby', () => {
    // We need to check if the input has aria-describedby pointing to the helper text
    const { container } = render(<UploadAvatar helperText="Error message" />);
    const input = container.querySelector('input[type="file"]');
    const helperText = screen.getByText('Error message');

    const descriptionId = input.getAttribute('aria-describedby');
    expect(descriptionId).toBeDefined();
    expect(helperText.id).toBe(descriptionId);
  });

  it('sets aria-invalid when error is true', () => {
    const { container } = render(<UploadAvatar error={true} />);
    const input = container.querySelector('input[type="file"]');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
