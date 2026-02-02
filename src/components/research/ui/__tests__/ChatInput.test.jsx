import { render, screen, cleanup } from '@testing-library/react';
import ChatInput from '../ChatInput';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock Redux
const mockDispatch = vi.fn();
let mockState = {
  researchUi: { uploadedFiles: [], isUploading: false },
  researchCore: { isStreaming: false }
};

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => selector(mockState),
}));

// Mock custom hook
const mockStartResearch = vi.fn();
const mockCancelResearch = vi.fn();

vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: () => ({
    startResearch: mockStartResearch,
    cancelResearch: mockCancelResearch,
  }),
}));

// Mock other dependencies
vi.mock('@/redux/slices/researchCoreSlice', () => ({
  setUserPrompt: vi.fn(),
}));

describe('ChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      researchUi: { uploadedFiles: [], isUploading: false },
      researchCore: { isStreaming: false }
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('renders input and button', () => {
    render(<ChatInput />);
    expect(screen.getAllByPlaceholderText(/Enter a new research topic/i)).toHaveLength(1);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('check accessibility attributes present', () => {
      render(<ChatInput />);

      const textarea = screen.getByPlaceholderText(/Enter a new research topic/i);
      expect(textarea.getAttribute('aria-label')).toBe('Research topic');

      // The button is disabled when input is empty, but labels should be there
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[0];

      expect(sendButton.getAttribute('aria-label')).toBe('Start research');
  });

  it('shows spinner when processing', () => {
      mockState = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: true }
      };

      render(<ChatInput />);
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons[0];

      expect(sendButton.getAttribute('aria-label')).toBe('Researching...');
      // Check for spinner. The spinner has role="status" and aria-label="Loading"
      expect(screen.getByRole('status')).toBeDefined();
      expect(screen.getByLabelText('Loading')).toBeDefined();
  });
});
