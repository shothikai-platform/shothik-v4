import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChatInput from '../ChatInput';
import { useSelector, useDispatch } from 'react-redux';
import { useResearchStream } from '@/hooks/useResearchStream';

// Mock dependencies
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: vi.fn(),
}));

vi.mock('@/redux/slices/researchCoreSlice', () => ({
  setUserPrompt: vi.fn(),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props) => <textarea {...props} />,
}));

vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <span data-testid="spinner">Loading...</span>,
}));

vi.mock('lucide-react', () => ({
  Send: () => <span>SendIcon</span>,
  Link: () => <span>LinkIcon</span>,
  X: () => <span>XIcon</span>,
}));

describe('ChatInput', () => {
  const mockDispatch = vi.fn();
  const mockStartResearch = vi.fn();
  const mockCancelResearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useResearchStream.mockReturnValue({
      startResearch: mockStartResearch,
      cancelResearch: mockCancelResearch,
    });
  });

  afterEach(() => {
    cleanup();
  });

  const setupMockState = (overrides = {}) => {
    const defaultUiState = { uploadedFiles: [], isUploading: false };
    const defaultCoreState = { isStreaming: false };

    // Allow overriding nested state
    const uiState = { ...defaultUiState, ...(overrides.researchUi || {}) };
    const coreState = { ...defaultCoreState, ...(overrides.researchCore || {}) };

    useSelector.mockImplementation((selector) => {
       // We create a fake state object to pass to the selector
       const state = {
         researchUi: uiState,
         researchCore: coreState
       };
       return selector(state);
    });
  };

  it('renders the Send button with aria-label', () => {
    setupMockState();
    render(<ChatInput />);

    const button = screen.getByRole('button');

    // Verify it has accessibility label
    expect(button.getAttribute('aria-label')).toBe("Send research request");

    // Verify it shows icon
    expect(screen.getByText('SendIcon')).not.toBeNull();
  });

  it('shows spinner when streaming', () => {
     setupMockState({
        researchCore: { isStreaming: true }
     });
     render(<ChatInput />);

     const button = screen.getByRole('button');
     expect(button.disabled).toBe(true);
     expect(screen.queryByText('SendIcon')).toBeNull();
     expect(screen.getByTestId('spinner')).not.toBeNull();
  });
});
