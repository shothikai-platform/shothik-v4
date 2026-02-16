import React from 'react';
import { render, screen } from '@testing-library/react';
import FileList from '../FileList';
import { vi, describe, it, expect } from 'vitest';

// Mock Tooltip components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }) => <div data-testid="tooltip-provider">{children}</div>,
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, 'aria-label': ariaLabel, className }) => (
    <button onClick={onClick} aria-label={ariaLabel} className={className}>
      {children}
    </button>
  ),
}));

describe('FileList', () => {
  const mockFiles = [
    { filename: 'test-file.pdf' },
    { filename: 'image.png' }
  ];
  const mockOnRemove = vi.fn();

  it('renders remove button with correct accessibility attributes when onRemove is provided', () => {
    const { getAllByLabelText } = render(<FileList files={mockFiles} onRemove={mockOnRemove} />);

    // Find remove buttons
    const removeButtons = getAllByLabelText(/Remove/);
    expect(removeButtons).toHaveLength(2);

    expect(removeButtons[0].getAttribute('aria-label')).toBe('Remove test-file.pdf');
    expect(removeButtons[1].getAttribute('aria-label')).toBe('Remove image.png');

    // Check for focus-visible class
    expect(removeButtons[0].className).toContain('focus-visible:opacity-100');
  });
});
