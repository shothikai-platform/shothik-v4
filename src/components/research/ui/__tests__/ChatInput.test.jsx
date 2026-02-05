import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import ChatInput from '../ChatInput';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock the hook
vi.mock('@/hooks/useResearchStream', () => ({
  useResearchStream: () => ({
    startResearch: vi.fn(),
    cancelResearch: vi.fn(),
  }),
}));

const createMockStore = () =>
  configureStore({
    reducer: {
      researchUi: (state = { uploadedFiles: [], isUploading: false }, action) => state,
      researchCore: (state = { isStreaming: false, userPrompt: '' }, action) => state,
    },
  });

describe('ChatInput', () => {
  it('renders with accessible labels', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <ChatInput />
      </Provider>
    );

    // Check Textarea aria-label
    const textarea = screen.getByLabelText('Research topic');
    expect(textarea).toBeTruthy();
    expect(textarea.getAttribute('placeholder')).toBe('Enter a new research topic');

    // Check Button aria-label
    const button = screen.getByLabelText('Start research');
    expect(button).toBeTruthy();
  });
});
