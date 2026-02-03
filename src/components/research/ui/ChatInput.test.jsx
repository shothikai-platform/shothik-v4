import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ChatInput from './ChatInput';
import * as reactRedux from 'react-redux';
import * as useResearchStreamModule from '@/hooks/useResearchStream';

// Mocks
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: vi.fn(),
}));

// Mock Textarea
vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder }) => (
    <textarea
      data-testid="chat-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

// Mock Tooltip components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
}));

// Mock Spinner
vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

describe('ChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useResearchStreamModule.useResearchStream.mockReturnValue({
      startResearch: vi.fn(),
      cancelResearch: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup(); // Manual cleanup required
    vi.clearAllMocks();
  });

  const setup = (stateOverrides = {}) => {
    reactRedux.useSelector.mockImplementation((selector) => {
      const defaultState = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: false },
      };
      // Simple selector logic simulation
      const state = {
          researchUi: { ...defaultState.researchUi, ...stateOverrides.researchUi },
          researchCore: { ...defaultState.researchCore, ...stateOverrides.researchCore }
      };
      return selector(state);
    });
    return render(<ChatInput />);
  };

  it('renders send button with correct aria-label', () => {
    setup();
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(b => b.className.includes('rounded-full'));
    expect(sendButton).toBeTruthy();

    // Verification
    expect(sendButton.getAttribute('aria-label')).toBe('Send research topic');
  });

  it('shows spinner and updates aria-label when streaming', () => {
    setup({ researchCore: { isStreaming: true } });

    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(b => b.className.includes('rounded-full'));

    expect(sendButton.disabled).toBe(true);

    // Verification: Spinner should be present
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeTruthy();

    // Verification: Aria label should update
    expect(sendButton.getAttribute('aria-label')).toBe('Processing research');
  });

  it('renders tooltip wrapper', () => {
     setup();
     const tooltipTrigger = screen.getByTestId('tooltip-trigger');
     expect(tooltipTrigger).toBeTruthy();
  });
});
