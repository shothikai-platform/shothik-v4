import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import UploadAvatar from '../UploadAvatar';

describe('UploadAvatar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a file input with sr-only class for accessibility', () => {
    const mockOnDrop = vi.fn();
    render(<UploadAvatar onDrop={mockOnDrop} />);

    // Check if the input exists in the DOM and has the expected attributes
    // Need to use querySelector since it's an input with type="file"
    const input = document.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    expect(input.classList.contains('sr-only')).toBe(true);
    expect(input.classList.contains('hidden')).toBe(false);
  });

  it('links the label to the input via htmlFor and id', () => {
    const mockOnDrop = vi.fn();
    render(<UploadAvatar onDrop={mockOnDrop} />);

    const input = document.querySelector('input[type="file"]');
    const label = document.querySelector('label');

    expect(input.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('applies focus-visible classes to the label for keyboard navigation', () => {
    const mockOnDrop = vi.fn();
    render(<UploadAvatar onDrop={mockOnDrop} />);

    const label = document.querySelector('label');
    expect(label.className).toContain('has-[:focus-visible]:ring-2');
    expect(label.className).toContain('has-[:focus-visible]:ring-ring');
  });
});