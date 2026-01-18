// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ButtonCopyText from './ButtonCopyText';

// Mock dependencies that might be problematic in jsdom
vi.mock('@/lib/utils', () => ({
  cn: (...args) => args.join(' '),
}));

vi.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon">Check</span>,
  Copy: () => <span data-testid="copy-icon">Copy</span>,
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock Tooltip components from UI
vi.mock('@/components/ui/tooltip', () => {
  return {
    Tooltip: ({ children }) => <div>{children}</div>,
    TooltipTrigger: ({ children, asChild }) => <div data-testid="tooltip-trigger">{children}</div>,
    TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
    TooltipProvider: ({ children }) => <div>{children}</div>,
  };
});

afterEach(() => {
  cleanup();
});

describe('ButtonCopyText', () => {
  it('renders a button with copy icon initially', () => {
    render(<ButtonCopyText text="Hello World" />);
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    // Check if it has the copy icon
    expect(screen.getByTestId('copy-icon')).toBeDefined();
  });

  it('shows check icon after clicking', async () => {
    const user = userEvent.setup();
    render(<ButtonCopyText text="Hello World" />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('check-icon')).toBeDefined();
    });
  });

  it('has accessible name and tooltip', () => {
    render(<ButtonCopyText text="Hello World" />);
    const button = screen.getByRole('button');

    expect(button.getAttribute('aria-label')).toBe('Copy text');
    expect(button.getAttribute('type')).toBe('button');

    const trigger = screen.getByTestId('tooltip-trigger');
    expect(trigger.contains(button)).toBe(true);
  });
});
