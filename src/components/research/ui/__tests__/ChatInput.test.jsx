import React from "react";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import ChatInput from "../ChatInput";

// Mock hooks
const mockDispatch = vi.fn();
const mockStartResearch = vi.fn();

// We need to mock useSelector to return different values in different tests
const mockUseSelector = vi.fn();

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) => mockUseSelector(selector),
}));

vi.mock("@/hooks/useResearchStream", () => ({
  useResearchStream: () => ({
    startResearch: mockStartResearch,
    cancelResearch: vi.fn(),
  }),
}));

describe("ChatInput", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Default state
    mockUseSelector.mockImplementation((selector) =>
      selector({
        researchUi: {
          uploadedFiles: [],
          isUploading: false,
        },
        researchCore: {
          isStreaming: false,
        },
      }),
    );
  });

  it("renders textarea and button", () => {
    render(<ChatInput />);
    expect(
      screen.getByPlaceholderText("Enter a new research topic"),
    ).toBeTruthy();
    expect(screen.getByLabelText("Research topic input")).toBeTruthy();

    // Initially button is disabled because input is empty
    const button = screen.getByRole("button", { name: /send research topic/i });
    expect(button).toBeDefined();
    expect(button.disabled).toBe(true);
  });

  it("updates input value", () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText("Enter a new research topic");
    fireEvent.change(input, { target: { value: "New Topic" } });
    expect(input.value).toBe("New Topic");
  });

  it("calls startResearch on submit", async () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText("Enter a new research topic");
    fireEvent.change(input, { target: { value: "Research Topic" } });

    const button = screen.getByRole("button", { name: /send research topic/i });
    expect(button.disabled).toBe(false);

    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalled();
    expect(mockStartResearch).toHaveBeenCalledWith(
      "Research Topic",
      expect.any(Object),
    );
  });

  it("button is disabled and shows loading state when streaming", () => {
    // Mock streaming state
    mockUseSelector.mockImplementation((selector) =>
      selector({
        researchUi: {
          uploadedFiles: [],
          isUploading: false,
        },
        researchCore: {
          isStreaming: true,
        },
      }),
    );

    render(<ChatInput />);
    const input = screen.getByPlaceholderText("Enter a new research topic");
    fireEvent.change(input, { target: { value: "Research Topic" } });

    const button = screen.getByRole("button", { name: /send research topic/i });
    expect(button.disabled).toBe(true);
  });
});
