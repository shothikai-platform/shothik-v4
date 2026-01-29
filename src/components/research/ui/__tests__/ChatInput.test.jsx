import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatInput from '../ChatInput';
import { vi, describe, it, expect } from 'vitest';
import * as reactRedux from 'react-redux';

// Mock Redux
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

// Mock hooks
vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: () => ({
    startResearch: vi.fn(),
    cancelResearch: vi.fn(),
  }),
}));

// Mock Tooltip components to avoid Radix UI issues in JSDOM
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Send: () => <svg data-testid="send-icon" />,
  Link: () => <svg data-testid="link-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

// Mock UI components that might cause issues or are not focus of test
vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props) => <textarea {...props} />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

describe('ChatInput', () => {
  it('renders the Send button with aria-label and tooltip', () => {
    // Setup mock selector implementation
    reactRedux.useSelector.mockImplementation((selector) => {
      const state = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: false, researches: [], activeResearchIndex: 0 },
      };
      return selector(state);
    });

    reactRedux.useDispatch.mockReturnValue(vi.fn());

    render(<ChatInput />);

    // Check for aria-label on the button
    // The button might be disabled initially because input is empty, but the label should be there.
    const button = screen.getByRole('button', { name: /start research/i });
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('Start Research');

    // Check for tooltip content
    // Since we mocked TooltipContent to always render (it's just a div), we can find it
    const tooltipContent = screen.getByText(/start research/i);
    expect(tooltipContent).toBeTruthy();

    // Check structure based on mocks
    expect(screen.getByTestId('tooltip')).toBeTruthy();
    expect(screen.getByTestId('tooltip-trigger')).toBeTruthy();
    expect(screen.getByTestId('tooltip-content')).toBeTruthy();
  });
});
