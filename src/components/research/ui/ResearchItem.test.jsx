import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResearchItem from './ResearchItem';
import { setResearchSelectedTab } from '@/redux/slices/researchCoreSlice';

// Hoist the mock function so it can be used in vi.mock factory
const { mockDispatch } = vi.hoisted(() => {
  return { mockDispatch: vi.fn() };
});

// Mock dependencies
vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

vi.mock('@/redux/slices/researchCoreSlice', () => ({
  setResearchSelectedTab: vi.fn(),
}));

// Mock child components
vi.mock('./HeaderTitle', () => ({
  default: () => <div data-testid="header-title">HeaderTitle</div>
}));

vi.mock('./TabPanel', () => ({
  default: ({ onTabChange }) => (
    <div data-testid="tabs-panel">
      <button onClick={() => onTabChange(1)}>Change Tab</button>
    </div>
  )
}));

vi.mock('./ResearchDataArea', () => ({
  default: () => <div data-testid="research-data-area">ResearchDataArea</div>
}));

describe('ResearchItem', () => {
  const mockResearch = {
    _id: '123',
    query: 'test query',
    selectedTab: 0,
    sources: [],
    images: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', () => {
    render(
      <ResearchItem
        research={mockResearch}
        headerHeight={20}
        setHeaderHeight={() => {}}
        isLastData={false}
      />
    );

    expect(screen.getByTestId('header-title')).toBeTruthy();
    expect(screen.getByTestId('tabs-panel')).toBeTruthy();
    expect(screen.getByTestId('research-data-area')).toBeTruthy();
  });

  it('dispatches setResearchSelectedTab when tab is changed', () => {
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    render(
      <ResearchItem
        research={mockResearch}
        headerHeight={20}
        setHeaderHeight={() => {}}
        isLastData={false}
      />
    );

    const changeTabButton = screen.getByText('Change Tab');
    fireEvent.click(changeTabButton);

    expect(mockDispatch).toHaveBeenCalled();
    expect(setResearchSelectedTab).toHaveBeenCalledWith({
      researchId: '123',
      selectedTab: 1
    });
  });
});
