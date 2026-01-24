import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ChatInput from '../ChatInput';

afterEach(() => {
  cleanup();
});

// Mock hooks
vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn(),
  useSelector: vi.fn((selector) => {
    // We need to handle the selector function execution
    // ChatInput uses: (state) => state.researchUi and (state) => state.researchCore
    const state = {
      researchUi: { uploadedFiles: [], isUploading: false },
      researchCore: { isStreaming: false, researches: [], activeResearchIndex: 0 }
    };
    return selector(state);
  }),
}));

vi.mock("@/hooks/useResearchStream", () => ({
  useResearchStream: () => ({ startResearch: vi.fn(), cancelResearch: vi.fn() }),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, "aria-label": ariaLabel, ...props }) => (
    <button aria-label={ariaLabel} {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ "aria-label": ariaLabel, ...props }) => (
    <textarea aria-label={ariaLabel} {...props} />
  ),
}));

// Mock Tooltip components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }) => <div>{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Send: () => <span data-testid="icon-send" />,
}));

describe('ChatInput', () => {
  it('renders textarea with correct aria-label', () => {
    render(<ChatInput />);
    // Check if textarea exists and has the label
    const textarea = screen.getByLabelText('Research topic');
    expect(textarea).toBeTruthy();
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
  });

  it('renders send button with correct aria-label and tooltip', () => {
    render(<ChatInput />);

    // Check for the button with the specific aria-label
    const button = screen.getByLabelText('Send research topic');
    expect(button).toBeTruthy();

    // Verify the tooltip content exists in the DOM (mocked)
    const tooltip = screen.getByTestId('tooltip-content');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toBe('Send research topic');
  });
});
