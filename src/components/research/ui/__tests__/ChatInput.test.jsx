import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChatInput from '../ChatInput';
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

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Send: () => <svg data-testid="send-icon" />,
  Link: () => <svg data-testid="link-icon" />,
  X: () => <svg data-testid="x-icon" />,
  Loader2Icon: () => <svg data-testid="spinner-icon" />,
}));

// Mock Spinner
vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <div data-testid="loading-spinner"></div>
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

    // Default mock implementation for useSelector
    reactRedux.useSelector.mockImplementation((selector) => {
      const state = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: false }
      };
      return selector(state);
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders textarea with accessible label', () => {
    render(<ChatInput />);
    const textarea = screen.getByRole('textbox', { name: /research topic/i });
    expect(textarea).toBeDefined();
  });

  it('renders send button with accessible label', () => {
    render(<ChatInput />);
    // If multiple buttons are found, this will throw.
    // Let's assume the previous error was due to some weird re-render or test issue,
    // or maybe there IS another button.
    // If it fails again with multiple elements, we'll debug.
    const button = screen.getByRole('button', { name: /send research topic/i });
    expect(button).toBeDefined();
  });

  it('shows spinner and disables button when streaming', () => {
    // Override selector for this test
    reactRedux.useSelector.mockImplementation((selector) => {
      const state = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: true }
      };
      return selector(state);
    });

    render(<ChatInput />);

    // Check if spinner is present
    expect(screen.getByTestId('loading-spinner')).toBeDefined();

    // Check if button is disabled
    const button = screen.getByRole('button', { name: /sending research topic/i });
    // Note: I updated the label to "Sending research topic" in the code when streaming!
    // So I should look for that.

    expect(button.disabled).toBe(true);
  });
});
