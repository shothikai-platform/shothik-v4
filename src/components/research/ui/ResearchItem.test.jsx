import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ResearchItem from './ResearchItem';
import { useDispatch } from 'react-redux';
import { setResearchSelectedTab } from '@/redux/slices/researchCoreSlice';
import React from 'react';

// Mock dependencies
vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
}));

vi.mock('@/redux/slices/researchCoreSlice', () => ({
  setResearchSelectedTab: vi.fn((payload) => ({ type: 'researchCore/setResearchSelectedTab', payload })),
}));

// Mock child components
vi.mock('./HeaderTitle', () => ({
  default: ({ query }) => <div data-testid="header-title">{query}</div>,
}));

vi.mock('./TabPanel', () => ({
  default: ({ onTabChange, selectedTab }) => (
    <div data-testid="tabs-panel">
      <button onClick={() => onTabChange(1)}>Change Tab</button>
      <span>Selected: {selectedTab}</span>
    </div>
  ),
}));

vi.mock('./ResearchDataArea', () => ({
  default: ({ onSwitchTab }) => (
      <div data-testid="research-data-area">
          <button onClick={() => onSwitchTab(2)}>Switch Tab Area</button>
      </div>
  ),
}));

describe('ResearchItem', () => {
  const mockDispatch = vi.fn();
  const mockScrollIntoView = vi.fn();

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockDispatch);
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockResearch = {
    _id: '123',
    query: 'Test Query',
    selectedTab: 0,
    sources: [],
    images: [],
  };

  it('renders correctly', () => {
    render(<ResearchItem research={mockResearch} isLastData={false} />);

    expect(screen.getByTestId('header-title').textContent).toBe('Test Query');
    expect(screen.getByTestId('tabs-panel')).not.toBeNull();
    expect(screen.getByTestId('research-data-area')).not.toBeNull();
  });

  it('dispatches setResearchSelectedTab and scrolls when tab changes via TabsPanel', () => {
    render(<ResearchItem research={mockResearch} isLastData={false} />);

    const button = screen.getByText('Change Tab');
    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'researchCore/setResearchSelectedTab',
      payload: { researchId: '123', selectedTab: 1 },
    });

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

   it('dispatches setResearchSelectedTab and scrolls when tab changes via ResearchDataArea', () => {
    render(<ResearchItem research={mockResearch} isLastData={false} />);

    const button = screen.getByText('Switch Tab Area');
    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'researchCore/setResearchSelectedTab',
      payload: { researchId: '123', selectedTab: 2 },
    });

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });
});
