import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeaderTitle from '../HeaderTitle';
import React from 'react';

// Mock dependencies
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, 'aria-label': ariaLabel, ...props }) => (
    <button aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  TooltipContent: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children }) => <div>{children}</div>,
}));

vi.mock('next/image', () => ({
  default: ({ alt }) => <img alt={alt} />,
}));

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });

describe('HeaderTitle', () => {
  it('renders with download button having correct aria-label and tooltip', () => {
    const props = {
      headerHeight: 20,
      setHeaderHeight: vi.fn(),
      query: 'Test Query',
      researchItem: { query: 'Test Query', result: 'Test Result', sources: [] }
    };

    render(<HeaderTitle {...props} />);

    // Check for button with aria-label
    // Since we mocked the components to simply render children, the Button with aria-label should be in the DOM
    const button = screen.getByLabelText('Download options');
    expect(button).toBeTruthy();

    // Check for tooltip content text
    // "Download options" should be present in the mocked TooltipContent
    // Using getAllByText because label text is also "Download options"
    const texts = screen.getAllByText('Download options');
    expect(texts.length).toBeGreaterThan(0);
  });
});
