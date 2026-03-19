import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import UploadAvatar from './UploadAvatar';

afterEach(() => {
  cleanup();
});

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props) => {
    return <img {...props} data-testid="next-image" />;
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Camera: () => <span data-testid="icon-camera" />
}));

describe('UploadAvatar Component', () => {
  it('renders upload photo prompt when no file is provided', () => {
    render(<UploadAvatar loading={false} onDrop={vi.fn()} />);

    expect(screen.getByText('Upload Photo')).toBeDefined();
    expect(screen.getByTestId('icon-camera')).toBeDefined();

    const input = screen.getByLabelText('Upload photo');
    expect(input).toBeDefined();
    expect(input.type).toBe('file');
  });

  it('renders image when file is provided', () => {
    render(<UploadAvatar file="avatar.jpg" loading={false} onDrop={vi.fn()} />);

    const image = screen.getByTestId('next-image');
    expect(image).toBeDefined();
    expect(image.getAttribute('src')).toBe('avatar.jpg');
  });

  it('handles file drop correctly', () => {
    const handleDrop = vi.fn();
    render(<UploadAvatar loading={false} onDrop={handleDrop} />);

    const input = screen.getByLabelText('Upload photo');
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(handleDrop).toHaveBeenCalledTimes(1);
    expect(handleDrop).toHaveBeenCalledWith(file);
  });

  it('renders disabled state correctly', () => {
    render(<UploadAvatar loading={true} onDrop={vi.fn()} />);

    const input = screen.getByLabelText('Upload photo');
    expect(input.disabled).toBe(true);
  });

  it('renders error state and helper text correctly', () => {
    render(
      <UploadAvatar
        error={true}
        helperText="Image too large"
        loading={false}
        onDrop={vi.fn()}
      />
    );

    expect(screen.getByText('Image too large')).toBeDefined();
  });
});
