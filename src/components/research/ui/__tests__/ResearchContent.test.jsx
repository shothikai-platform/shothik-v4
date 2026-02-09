import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResearchContent from '../ResearchContent';
import * as reactRedux from 'react-redux';

// Mock dependencies
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock('marked', () => {
  const markedFn = vi.fn((text) => text);
  markedFn.setOptions = vi.fn();
  return { marked: markedFn };
});

vi.mock('../../../tools/research/ResearchContentWithReferences', () => ({
  default: ({ content }) => <div data-testid="research-content-references">{content}</div>,
}));

describe('ResearchContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders content with references when sources exist', () => {
    const mockState = {
      researchCore: { isStreaming: false, isPolling: false },
      researchChat: { currentChatId: '123' },
    };

    vi.mocked(reactRedux.useSelector).mockImplementation((selector) => selector(mockState));

    const props = {
      currentResearch: {
        result: 'Test Result',
        sources: [{ title: 'Source 1', url: 'http://example.com', reference: 1 }],
      },
      isLastData: true,
      onSwitchTab: vi.fn(),
    };

    render(<ResearchContent {...props} />);

    expect(screen.getByTestId('research-content-references')).toBeDefined();
    expect(screen.getByText('Test Result')).toBeDefined();
  });

  it('renders MessageBubble when no sources exist', () => {
    const mockState = {
        researchCore: { isStreaming: false, isPolling: false },
        researchChat: { currentChatId: '123' },
    };

    vi.mocked(reactRedux.useSelector).mockImplementation((selector) => selector(mockState));

    const props = {
        currentResearch: {
            result: 'Test Result No Sources',
            sources: [],
        },
        isLastData: true,
    };

    render(<ResearchContent {...props} />);

    // MessageBubble renders dangerouslySetInnerHTML with marked(message)
    // marked is mocked to return text
    // So we should see the text
    expect(screen.getByText('Test Result No Sources')).toBeDefined();
    // And NOT references component
    expect(screen.queryByTestId('research-content-references')).toBeNull();
  });
});
