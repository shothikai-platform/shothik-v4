import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ChatInput from '../ChatInput';
import { vi, describe, it, expect, afterEach } from 'vitest';

const { startResearchSpy } = vi.hoisted(() => ({ startResearchSpy: vi.fn() }));

afterEach(() => {
  cleanup();
});

// Mock Redux
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector) => selector({
    researchUi: { uploadedFiles: [], isUploading: false },
    researchCore: { isStreaming: false }
  }),
}));

// Mock custom hooks
vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: () => ({
    startResearch: startResearchSpy,
    cancelResearch: vi.fn(),
  }),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, 'aria-label': ariaLabel, className }) => (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={className}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props) => <textarea {...props} />,
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
}));

// Mock icons
vi.mock('lucide-react', () => ({
  Send: () => <span data-testid="send-icon">Send</span>,
  Link: () => <span>Link</span>,
  X: () => <span>X</span>,
}));

// Mock Redux actions
vi.mock('@/redux/slices/researchCoreSlice', () => ({
  setUserPrompt: vi.fn(),
}));

describe('ChatInput', () => {
  it('renders the send button with correct aria-label and tooltip', () => {
    render(<ChatInput />);

    const sendButton = screen.getByRole('button', { name: /start research/i });
    expect(sendButton).toBeDefined();

    // Check for Tooltip components
    expect(screen.getByTestId('tooltip')).toBeDefined();
    expect(screen.getByTestId('tooltip-trigger')).toBeDefined();
    expect(screen.getByTestId('tooltip-content').textContent).toMatch(/start research/i);
  });

  it('calls startResearch when send button is clicked', () => {
    render(<ChatInput />);

    // Type into textarea to enable button
    const textarea = screen.getByPlaceholderText(/enter a new research topic/i);
    fireEvent.change(textarea, { target: { value: 'Test query' } });

    const sendButton = screen.getByRole('button', { name: /start research/i });
    expect(sendButton).toBeDefined();
    // Use toBeEnabled matcher if available, otherwise check disabled attribute
    expect(sendButton.disabled).toBe(false);

    // Click
    fireEvent.click(sendButton);

    expect(startResearchSpy).toHaveBeenCalledWith('Test query', expect.anything());
  });
});
