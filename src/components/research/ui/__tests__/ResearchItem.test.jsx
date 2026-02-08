import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import ResearchItem from "../ResearchItem";
import * as reactRedux from "react-redux";

// Mock child components
vi.mock("../HeaderTitle", () => ({
  default: () => <div data-testid="header-title">HeaderTitle</div>,
}));
vi.mock("../ResearchDataArea", () => ({
  default: ({ onSwitchTab }) => (
    <div data-testid="research-data-area">
      <button onClick={() => onSwitchTab(1)}>Switch Tab</button>
    </div>
  ),
}));
vi.mock("../TabPanel", () => ({
  default: ({ onTabChange }) => (
    <div data-testid="tabs-panel">
      <button onClick={() => onTabChange(1)}>Change Tab</button>
    </div>
  ),
}));

// Mock react-redux
vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("ResearchItem", () => {
  const mockDispatch = vi.fn();
  const mockResearch = {
    _id: "test-id",
    query: "test query",
    selectedTab: 0,
    sources: [],
    images: [],
  };

  beforeEach(() => {
    vi.mocked(reactRedux.useDispatch).mockReturnValue(mockDispatch);
    mockDispatch.mockClear();
    window.HTMLElement.prototype.scrollIntoView.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders correctly", () => {
    render(<ResearchItem research={mockResearch} isLastData={false} />);

    expect(screen.getByTestId("header-title")).toBeTruthy();
    expect(screen.getByTestId("tabs-panel")).toBeTruthy();
    expect(screen.getByTestId("research-data-area")).toBeTruthy();
  });

  it("dispatches action and scrolls on tab change", () => {
    render(<ResearchItem research={mockResearch} isLastData={false} />);

    const changeTabButton = screen.getByText("Change Tab");
    fireEvent.click(changeTabButton);

    expect(mockDispatch).toHaveBeenCalled();
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
