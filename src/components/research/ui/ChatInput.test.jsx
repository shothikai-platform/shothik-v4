import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ChatInput from './ChatInput';
import { vi, describe, it, expect, afterEach } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: vi.fn((selector) => {
    const mockState = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: false }
    };
    return selector(mockState);
  }),
}));

vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: () => ({
    startResearch: vi.fn(),
    cancelResearch: vi.fn(),
  }),
}));

// Mock Tooltip components to avoid Radix issues and simplify testing
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
}));

afterEach(() => {
  cleanup();
});

describe('ChatInput', () => {
    it('renders the Send button disabled initially with correct tooltip text', () => {
        render(<ChatInput />);
        // The button inside the trigger
        const button = screen.getByRole('button', { name: /enter a topic to start/i });
        expect(button).toBeDefined();
        // Check disabled state via DOM property since jest-dom is not available
        expect(button.disabled).toBe(true);

        // Check tooltip content exists in DOM (since we mocked it to render always)
        expect(screen.getByText(/enter a topic to start/i)).toBeDefined();
    });

    it('enables button when text is entered and updates tooltip', () => {
        render(<ChatInput />);

        const input = screen.getByPlaceholderText(/enter a new research topic/i);
        fireEvent.change(input, { target: { value: 'Hello' } });

        const button = screen.getByRole('button', { name: /start research/i });
        expect(button.disabled).toBe(false);

        // Tooltip text update
        expect(screen.getByText(/start research/i)).toBeDefined();
    });
});
