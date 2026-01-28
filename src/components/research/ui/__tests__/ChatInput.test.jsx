import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ChatInput from '../ChatInput';
import { useSelector, useDispatch } from 'react-redux';

// Mock dependencies
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: () => ({
    startResearch: vi.fn(),
    cancelResearch: vi.fn(),
  }),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props) => <textarea {...props} />,
}));

// Mock Tooltip UI component
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Send: () => <span>SendIcon</span>,
}));

afterEach(() => {
  cleanup();
});

describe('ChatInput', () => {
  it('renders Send button with aria-label and correct disabled state', () => {
    // Mock selector state
    useSelector.mockImplementation((callback) => {
      const state = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: false, researches: [], activeResearchIndex: 0 },
      };
      return callback(state);
    });
    useDispatch.mockReturnValue(vi.fn());

    render(<ChatInput />);

    // Check for aria-label on the button
    const sendButton = screen.getByLabelText('Start research');
    expect(sendButton).toBeTruthy();
    expect(sendButton.disabled).toBe(true);

    // Check tooltip content for disabled state
    const tooltip = screen.getByTestId('tooltip-content');
    expect(tooltip.textContent).toBe('Enter a topic to start');
  });
});
