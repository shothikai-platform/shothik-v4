import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChatInput from '../ChatInput';
import { useDispatch, useSelector } from 'react-redux';
import { useResearchStream } from '@/hooks/useResearchStream';

// Mock Redux
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

// Mock hook
vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Send: () => <svg data-testid="SendIcon" />,
  Link: () => <svg data-testid="LinkIcon" />,
  X: () => <svg data-testid="XIcon" />,
}));

// Mock UI components if necessary.
// Since Tooltip relies on Radix UI which might need real DOM environment or mocks,
// and we want to verify structure.
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div data-testid="Tooltip">{children}</div>,
  TooltipTrigger: ({ children }) => <div data-testid="TooltipTrigger">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="TooltipContent">{children}</div>,
  TooltipProvider: ({ children }) => <div data-testid="TooltipProvider">{children}</div>,
}));


describe('ChatInput', () => {
  const mockDispatch = vi.fn();
  const mockStartResearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useResearchStream.mockReturnValue({
      startResearch: mockStartResearch,
      cancelResearch: vi.fn(),
    });

    useSelector.mockReturnValue({
        uploadedFiles: [],
        isUploading: false,
        isStreaming: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders input and button with accessibility attributes', () => {
    render(<ChatInput />);

    // Check for aria-label on textarea
    const textarea = screen.getByPlaceholderText('Enter a new research topic');
    expect(textarea).toBeDefined();
    expect(textarea.getAttribute('aria-label')).toBe('Research topic input');

    // Check for aria-label on button
    const button = screen.getByTestId('SendIcon').closest('button');
    expect(button).toBeDefined();
    expect(button.getAttribute('aria-label')).toBe('Start research');
  });

  it('wraps the send button in a tooltip', () => {
    render(<ChatInput />);

    const tooltip = screen.getByTestId('Tooltip');
    expect(tooltip).toBeDefined();

    const tooltipTrigger = screen.getByTestId('TooltipTrigger');
    expect(tooltipTrigger).toBeDefined();
    expect(tooltipTrigger.contains(screen.getByTestId('SendIcon').closest('button'))).toBe(true);

    const tooltipContent = screen.getByTestId('TooltipContent');
    expect(tooltipContent).toBeDefined();
    expect(tooltipContent.textContent).toBe('Start research');
  });
});
