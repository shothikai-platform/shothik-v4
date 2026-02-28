import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ButtonInsertDocumentText from '../ButtonInsertDocumentText';

afterEach(() => {
  cleanup();
});

// Mock Tooltip UI component to avoid Radix UI complexity in JSDOM
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }) => <div>{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Upload: () => <span data-testid="icon-upload" />,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  buttonVariants: vi.fn().mockImplementation(({ variant, size }) => `btn-${variant}-${size}`),
}));

vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <span data-testid="spinner" />,
}));

describe('ButtonInsertDocumentText', () => {
  it('renders correctly', () => {
    const { container } = render(<ButtonInsertDocumentText />);

    // Check if the label is rendered
    const label = container.querySelector('label');
    expect(label).toBeTruthy();

    // Check if the input is rendered inside the label
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();

    // Check if the text is rendered
    expect(screen.getByText('Upload Document')).toBeTruthy();
  });

  it('has focus-within classes for accessibility', () => {
    const { container } = render(<ButtonInsertDocumentText />);

    const label = container.querySelector('label');
    expect(label.className).toContain('focus-within:ring-2');
    expect(label.className).toContain('focus-within:ring-ring');
  });

  it('applies focus styles when input is focused', () => {
    render(<ButtonInsertDocumentText />);

    const input = screen.getByText('Upload Document').parentElement.nextElementSibling;
    input.focus();

    expect(document.activeElement).toBe(input);
  });
});
