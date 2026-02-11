import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import UploadAvatar from '../UploadAvatar';

// Mock Next/Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Camera: () => <svg data-testid="camera-icon" />,
}));

describe('UploadAvatar Component', () => {
  const mockOnDrop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders file input with correct label', () => {
    render(<UploadAvatar onDrop={mockOnDrop} />);

    // This expects the input to be associated with the label "Upload Photo"
    const input = screen.getByLabelText(/upload photo/i);
    expect(input).not.toBeNull();
    expect(input.type).toBe('file');
  });

  test('calls onDrop when a file is selected', () => {
    render(<UploadAvatar onDrop={mockOnDrop} />);

    const input = screen.getByLabelText(/upload photo/i);
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnDrop).toHaveBeenCalledTimes(1);
    expect(mockOnDrop).toHaveBeenCalledWith(file);
  });

  test('displays helper text', () => {
    render(<UploadAvatar onDrop={mockOnDrop} helperText="Required field" />);
    expect(screen.getByText('Required field')).not.toBeNull();
  });

  test('is disabled when loading prop is true', () => {
    render(<UploadAvatar onDrop={mockOnDrop} loading={true} />);
    const input = screen.getByLabelText(/upload photo/i);
    expect(input.disabled).toBe(true);
  });
});
