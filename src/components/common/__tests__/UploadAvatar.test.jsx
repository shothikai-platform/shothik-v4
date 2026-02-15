import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import UploadAvatar from '../UploadAvatar';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Camera: (props) => <svg {...props} data-testid="camera-icon" />,
}));

describe('UploadAvatar', () => {
  const mockOnDrop = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders correctly with default state', () => {
    render(<UploadAvatar onDrop={mockOnDrop} />);

    // Check if the input is present
    const input = screen.getByLabelText(/upload photo/i);
    expect(input).toBeTruthy();
    // In the new implementation, class is sr-only, not hidden
    expect(input.type).toBe('file');

    // Check if the camera icon is present
    expect(screen.getByTestId('camera-icon')).toBeTruthy();
  });

  it('handles file selection', () => {
    render(<UploadAvatar onDrop={mockOnDrop} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload photo/i);

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockOnDrop).toHaveBeenCalledWith(file);
  });

  it('displays helper text when provided', () => {
    const helperText = 'Max size 5MB';
    render(<UploadAvatar onDrop={mockOnDrop} helperText={helperText} />);

    const helperEl = screen.getByText(helperText);
    expect(helperEl).toBeTruthy();
    // Helper text should be neutral now (text-muted-foreground)
    expect(helperEl.className).toContain('text-muted-foreground');
  });

  it('applies error styles when error prop is true', () => {
    const { container } = render(<UploadAvatar onDrop={mockOnDrop} error={true} />);

    const label = container.querySelector('label');
    expect(label.className).toContain('border-destructive');
  });

  it('displays errorMessage and links it via aria-errormessage', () => {
    const errorMessage = 'File too large';
    render(<UploadAvatar onDrop={mockOnDrop} errorMessage={errorMessage} />);

    const errorEl = screen.getByText(errorMessage);
    expect(errorEl).toBeTruthy();
    expect(errorEl.className).toContain('text-destructive');

    const input = screen.getByLabelText(/upload photo/i);
    expect(input.getAttribute('aria-errormessage')).toBe(errorEl.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    // Also aria-describedby should include it
    expect(input.getAttribute('aria-describedby')).toContain(errorEl.id);
  });

  it('associates helper text with input via aria-describedby', () => {
      const helperText = 'Max size 5MB';
      render(<UploadAvatar onDrop={mockOnDrop} helperText={helperText} />);

      const input = screen.getByLabelText(/upload photo/i);
      const helperTextElement = screen.getByText(helperText);

      expect(input.getAttribute('aria-describedby')).toContain(helperTextElement.id);
  });

  it('input has focus styles via parent label focus-within', () => {
     const { container } = render(<UploadAvatar onDrop={mockOnDrop} />);
     const label = container.querySelector('label');
     expect(label.className).toContain('focus-within:ring-2');
  });
});
