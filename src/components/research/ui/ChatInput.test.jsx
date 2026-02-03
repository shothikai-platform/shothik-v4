import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ChatInput from './ChatInput';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock dependencies
vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: () => ({
    startResearch: vi.fn(),
    cancelResearch: vi.fn(),
  }),
}));

vi.mock('@/redux/slices/researchCoreSlice', () => ({
  setUserPrompt: (prompt) => ({ type: 'researchCore/setUserPrompt', payload: prompt }),
}));

// Mock Spinner and Send icon to verify rendering
vi.mock('@/components/ui/spinner', () => ({
  Spinner: () => <div data-testid="spinner">Spinner</div>,
}));

vi.mock('lucide-react', () => ({
  Send: () => <div data-testid="send-icon">Send</div>,
  Link: () => <div>Link</div>,
  X: () => <div>X</div>,
}));

// Setup Redux store
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      researchUi: (state = initialState.researchUi, action) => state,
      researchCore: (state = initialState.researchCore, action) => state,
    },
    preloadedState: initialState,
  });
};

describe('ChatInput', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultState = {
    researchUi: {
      uploadedFiles: [],
      isUploading: false,
    },
    researchCore: {
      isStreaming: false,
    },
  };

  it('renders correctly and is accessible', () => {
    const store = createMockStore(defaultState);
    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    // Initial check: Button exists and has aria-label
    const button = screen.getByRole('button', { name: /start research/i });
    expect(button).not.toBeNull();

    // Check if send icon is present
    expect(screen.getByTestId('send-icon')).not.toBeNull();

    // Textarea exists and has aria-label
    const textarea = screen.getByLabelText('Research topic input');
    expect(textarea).not.toBeNull();
  });

  it('shows loading state when processing', () => {
    const processingState = {
      ...defaultState,
      researchCore: {
        isStreaming: true,
      },
    };

    const store = createMockStore(processingState);
    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    // Button should be disabled and have processing label
    const button = screen.getByRole('button', { name: /processing/i });
    expect(button).not.toBeNull();
    expect(button.disabled).toBe(true);

    // Spinner should be visible instead of Send icon
    expect(screen.getByTestId('spinner')).not.toBeNull();
    expect(screen.queryByTestId('send-icon')).toBeNull();
  });
});
