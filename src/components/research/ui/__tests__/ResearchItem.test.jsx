import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ResearchItem from "../ResearchItem";

// Mock dependencies
vi.mock("../HeaderTitle", () => ({
  default: ({ query }) => <div data-testid="header-title">{query}</div>,
}));

vi.mock("../TabPanel", () => ({
  default: ({ onTabChange }) => (
    <div data-testid="tabs-panel">
      <button onClick={() => onTabChange(1)}>Change Tab</button>
    </div>
  ),
}));

vi.mock("../ResearchDataArea", () => ({
  default: ({ onSwitchTab }) => (
    <div data-testid="research-data-area">
      <button onClick={() => onSwitchTab(2)}>Switch Tab Area</button>
    </div>
  ),
}));

vi.mock("@/redux/slices/researchCoreSlice", () => ({
  setResearchSelectedTab: vi.fn((payload) => ({
    type: "researchCore/setResearchSelectedTab",
    payload,
  })),
}));

describe("ResearchItem", () => {
  const mockDispatch = vi.fn();
  const mockResearch = {
    _id: "123",
    query: "Test Query",
    selectedTab: 0,
    sources: [],
    images: [],
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
    render(
      <ResearchItem
        research={mockResearch}
        isLastData={false}
        dispatch={mockDispatch}
      />
    );

    expect(screen.getByTestId("header-title").textContent).toBe("Test Query");
    expect(screen.getByTestId("tabs-panel")).toBeTruthy();
    expect(screen.getByTestId("research-data-area")).toBeTruthy();
  });

  it("handles tab change from TabsPanel", () => {
    render(
      <ResearchItem
        research={mockResearch}
        isLastData={false}
        dispatch={mockDispatch}
      />
    );

    const button = screen.getByText("Change Tab");
    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "researchCore/setResearchSelectedTab",
      payload: { researchId: "123", selectedTab: 1 },
    });
  });

  it("handles tab switch from ResearchDataArea", () => {
    render(
      <ResearchItem
        research={mockResearch}
        isLastData={false}
        dispatch={mockDispatch}
      />
    );

    const button = screen.getByText("Switch Tab Area");
    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "researchCore/setResearchSelectedTab",
      payload: { researchId: "123", selectedTab: 2 },
    });
  });
});
