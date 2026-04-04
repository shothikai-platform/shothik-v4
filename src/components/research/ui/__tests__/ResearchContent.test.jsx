import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ResearchContent from '../ResearchContent';
import React from 'react';
import * as markedModule from 'marked';

// Mock imports
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

vi.mock('marked', () => ({
  marked: vi.fn((text) => `<p>${text}</p>`),
}));

vi.mock('../../tools/research/ResearchContentWithReferences', () => ({
  default: () => <div data-testid="research-content-with-references" />,
}));

// Mock Redux slices
vi.mock('@/redux/slices/researchChatSlice', () => ({
  researchChatState: 'researchChatState',
}));
vi.mock('@/redux/slices/researchCoreSlice', () => ({
  researchCoreState: 'researchCoreState',
}));

import { useSelector } from 'react-redux';

describe('ResearchContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSelector.mockImplementation((selector) => {
      if (selector === 'researchChatState') {
        return { currentChatId: 'chat-1' };
      }
      if (selector === 'researchCoreState') {
        return { isStreaming: false, isPolling: false };
      }
      return {};
    });
  });

  it('renders MessageBubble when no sources are present', () => {
    const props = {
      currentResearch: { result: 'Test Content', sources: [] },
      isLastData: true,
      onSwitchTab: vi.fn(),
    };

    render(<ResearchContent {...props} />);

    // Check if content is rendered
    expect(screen.getByText('Test Content')).toBeDefined();
  });
});
