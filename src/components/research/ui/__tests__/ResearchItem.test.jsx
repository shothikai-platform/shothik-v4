import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import ResearchItem from "../ResearchItem";

// Mock child components
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
      <button onClick={() => onSwitchTab(2)}>Switch Tab</button>
    </div>
  ),
}));

describe("ResearchItem", () => {
  afterEach(() => {
    cleanup();
  });

  const mockResearch = {
    _id: "res-123",
    query: "Test Query",
    selectedTab: 0,
    sources: [],
    images: [],
  };

  it("renders correctly", () => {
    render(
      <ResearchItem
        research={mockResearch}
        isLastData={false}
        onTabChange={vi.fn()}
      />
    );

    expect(screen.getByTestId("header-title").textContent).toBe("Test Query");
    expect(screen.getByTestId("tabs-panel")).toBeTruthy();
    expect(screen.getByTestId("research-data-area")).toBeTruthy();
  });

  it("calls onTabChange when tab is changed via TabsPanel", () => {
    const onTabChange = vi.fn();
    render(
      <ResearchItem
        research={mockResearch}
        isLastData={false}
        onTabChange={onTabChange}
      />
    );

    fireEvent.click(screen.getByText("Change Tab"));
    expect(onTabChange).toHaveBeenCalledWith("res-123", 1);
  });

  it("calls onTabChange when tab is switched via ResearchDataArea", () => {
    const onTabChange = vi.fn();
    render(
      <ResearchItem
        research={mockResearch}
        isLastData={false}
        onTabChange={onTabChange}
      />
    );

    fireEvent.click(screen.getByText("Switch Tab"));
    expect(onTabChange).toHaveBeenCalledWith("res-123", 2);
  });
});
