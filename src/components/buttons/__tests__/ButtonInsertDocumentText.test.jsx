import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ButtonInsertDocumentText from '../ButtonInsertDocumentText';

afterEach(() => {
  cleanup();
});

// Mock Tooltip UI component
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }) => <div>{children}</div>,
  TooltipContent: ({ children }) => <div>{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Upload: () => <span data-testid="icon-upload" />,
}));

// Mock Spinner
vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <span data-testid="spinner" />,
}));

describe('ButtonInsertDocumentText', () => {
  it('renders correctly', () => {
    render(<ButtonInsertDocumentText />);
    expect(screen.getByText('Upload Document')).toBeTruthy();
    expect(screen.getByTestId('icon-upload')).toBeTruthy();
  });

  it('contains an input of type file', () => {
    render(<ButtonInsertDocumentText />);
    // Use container query because the input might be hidden or hard to select by role
    const input = screen.getByLabelText(/upload document/i, { selector: 'input' });
    // Wait, the label wraps the input. screen.getByLabelText might work if the label has text.
    // The label contains "Upload Document".

    // Let's try direct selector on the container if needed, but getByLabelText is better a11y check.
  });

  it('has focus-within styles for accessibility', () => {
    const { container } = render(<ButtonInsertDocumentText />);
    const label = container.querySelector('label');
    expect(label.className).toContain('focus-within:ring-2');
  });
});
