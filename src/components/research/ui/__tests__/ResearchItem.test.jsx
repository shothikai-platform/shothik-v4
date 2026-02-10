import React from 'react';
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ResearchItem from "../ResearchItem";
import * as researchCoreSlice from "@/redux/slices/researchCoreSlice";

// Mock child components
vi.mock("../HeaderTitle", () => ({
  default: ({ query }) => <div data-testid="header-title">{query}</div>,
}));

vi.mock("../TabPanel", () => ({
  default: ({ selectedTab, onTabChange }) => (
    <div data-testid="tabs-panel">
      <span>Tab: {selectedTab}</span>
      <button onClick={() => onTabChange(1)}>Change Tab</button>
    </div>
  ),
}));

vi.mock("../ResearchDataArea", () => ({
  default: ({ onSwitchTab }) => (
    <div data-testid="research-data-area">
      <button onClick={() => onSwitchTab(2)}>Switch Tab</button>
    </div>
  ),
}));

// Mock Redux
const mockDispatch = vi.fn();
vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

// Mock action
vi.mock("@/redux/slices/researchCoreSlice", () => ({
  setResearchSelectedTab: vi.fn((payload) => ({ type: "mock/action", payload })),
}));

describe("ResearchItem", () => {
  const mockResearch = {
    _id: "123",
    query: "Test Query",
    selectedTab: 0,
    sources: [],
    images: [],
    result: "Test Result",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders correctly", () => {
    render(<ResearchItem research={mockResearch} isLastData={false} />);

    expect(screen.getByTestId("header-title").textContent).toContain("Test Query");
    expect(screen.getByTestId("tabs-panel").textContent).toContain("Tab: 0");
    expect(screen.getByTestId("research-data-area")).not.toBeNull();
  });

  it("dispatches action and scrolls when tab changes via TabPanel", () => {
    render(<ResearchItem research={mockResearch} isLastData={false} />);

    fireEvent.click(screen.getByText("Change Tab"));

    expect(researchCoreSlice.setResearchSelectedTab).toHaveBeenCalledWith({
      researchId: "123",
      selectedTab: 1,
    });
    expect(mockDispatch).toHaveBeenCalled();
    // Verify scrollIntoView was called on the container (or any element)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("dispatches action and scrolls when tab changes via ResearchDataArea", () => {
    render(<ResearchItem research={mockResearch} isLastData={false} />);

    fireEvent.click(screen.getByText("Switch Tab"));

    expect(researchCoreSlice.setResearchSelectedTab).toHaveBeenCalledWith({
      researchId: "123",
      selectedTab: 2,
    });
    expect(mockDispatch).toHaveBeenCalled();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
