import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ChatInput from './ChatInput';
import * as reactRedux from 'react-redux';
import * as useResearchStreamHook from '@/hooks/useResearchStream';

// Mock dependencies
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Send: (props) => <span data-testid="send-icon" {...props} />,
  X: (props) => <span data-testid="x-icon" {...props} />,
  Loader2: (props) => <span data-testid="loader-icon" {...props} />,
}));

// Mock Spinner
vi.mock('@/components/ui/spinner', () => ({
  Spinner: (props) => <span data-testid="spinner-icon" {...props} />,
}));

// Mock Tooltip components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
}));

describe('ChatInput', () => {
  const mockDispatch = vi.fn();
  const mockStartResearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    reactRedux.useDispatch.mockReturnValue(mockDispatch);
    useResearchStreamHook.useResearchStream.mockReturnValue({
      startResearch: mockStartResearch,
      cancelResearch: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders accessible send button with tooltip when idle', () => {
    // Mock idle state
    reactRedux.useSelector.mockImplementation((selector) => {
      const state = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: false },
      };
      return selector(state);
    });

    render(<ChatInput />);

    const sendButton = screen.getByRole('button', { name: /send research query/i });

    expect(sendButton).toBeTruthy();
    expect(sendButton.getAttribute('aria-label')).toBe('Send research query');
    expect(screen.getByTestId('send-icon')).toBeTruthy();
    expect(screen.queryByTestId('spinner-icon')).toBeNull();

    // Check tooltip content exists (mocked)
    expect(screen.getByText('Enter a topic to start')).toBeTruthy();
  });

  it('shows spinner and processing tooltip when processing', () => {
    // Mock processing state
    reactRedux.useSelector.mockImplementation((selector) => {
      const state = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: true }, // Simulate streaming
      };
      return selector(state);
    });

    render(<ChatInput />);

    const sendButton = screen.getByRole('button', { name: /send research query/i });

    expect(sendButton).toBeTruthy();
    expect(sendButton.disabled).toBe(true);
    expect(screen.getByTestId('spinner-icon')).toBeTruthy();
    expect(screen.queryByTestId('send-icon')).toBeNull();

    // Check tooltip content
    expect(screen.getByText('Research in progress...')).toBeTruthy();
  });
});
