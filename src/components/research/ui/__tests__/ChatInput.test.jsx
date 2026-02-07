import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ChatInput from "../ChatInput";
import { useSelector, useDispatch } from "react-redux";
import { useResearchStream } from "@/hooks/useResearchStream";

// Mock dependencies
vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
  useDispatch: vi.fn(),
}));

vi.mock("@/hooks/useResearchStream", () => ({
  useResearchStream: vi.fn(),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: ({ value, onChange, placeholder }) => (
    <textarea
      data-testid="textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, "aria-label": ariaLabel }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid="submit-button"
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

vi.mock("lucide-react", () => ({
  Send: () => <div data-testid="send-icon">Send</div>,
}));

describe("ChatInput", () => {
  const mockDispatch = vi.fn();
  const mockStartResearch = vi.fn();

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useResearchStream.mockReturnValue({
      startResearch: mockStartResearch,
      cancelResearch: vi.fn(),
    });

    // Default state: not loading
    useSelector.mockImplementation((selector) => {
      const state = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: false },
      };
      return selector(state);
    });
  });

  it("renders correctly", () => {
    render(<ChatInput />);
    expect(
      screen.getByPlaceholderText("Enter a new research topic"),
    ).toBeDefined();
    expect(screen.getByTestId("submit-button")).toBeDefined();
    // Should show send icon
    expect(screen.getByTestId("send-icon")).toBeDefined();
    // Should have correct aria-label
    expect(screen.getByTestId("submit-button").getAttribute("aria-label")).toBe(
      "Start research",
    );
  });

  it("shows loading state when isStreaming is true", () => {
    useSelector.mockImplementation((selector) => {
      const state = {
        researchUi: { uploadedFiles: [], isUploading: false },
        researchCore: { isStreaming: true },
      };
      return selector(state);
    });

    render(<ChatInput />);

    // Should show spinner
    expect(screen.getByTestId("spinner")).toBeDefined();
    // Should NOT show send icon
    expect(screen.queryByTestId("send-icon")).toBeNull();
    // Should have loading aria-label
    expect(screen.getByTestId("submit-button").getAttribute("aria-label")).toBe(
      "Researching...",
    );
    // Should be disabled
    expect(screen.getByTestId("submit-button").disabled).toBe(true);
  });

  it("shows loading state when isUploading is true", () => {
    useSelector.mockImplementation((selector) => {
      const state = {
        researchUi: { uploadedFiles: [], isUploading: true },
        researchCore: { isStreaming: false },
      };
      return selector(state);
    });

    render(<ChatInput />);

    expect(screen.getByTestId("spinner")).toBeDefined();
    expect(screen.getByTestId("submit-button").getAttribute("aria-label")).toBe(
      "Researching...",
    );
  });
});
