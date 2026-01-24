import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ChatInput from "../ChatInput";

// Mock dependencies
vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector) => {
    const state = {
      researchUi: { uploadedFiles: [], isUploading: false },
      researchCore: { isStreaming: false },
    };
    return selector(state);
  },
}));

vi.mock("@/hooks/useResearchStream", () => ({
  useResearchStream: () => ({
    startResearch: vi.fn(),
    cancelResearch: vi.fn(),
    isStreaming: false,
    isPolling: false,
    jobId: null,
    manualReconnect: vi.fn(),
    checkAndRecoverConnection: vi.fn(),
  }),
}));

vi.mock("@/redux/slices/researchCoreSlice", () => ({
  setUserPrompt: vi.fn(),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, "aria-label": ariaLabel, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props) => <textarea {...props} />,
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
}));

vi.mock("lucide-react", () => ({
  Send: () => <span>SendIcon</span>,
}));

describe("ChatInput", () => {
  it("renders the send button with correct aria-label and tooltip", () => {
    render(<ChatInput />);

    // Check for aria-label on the button
    const sendButton = screen.getByLabelText("Start Research");
    expect(sendButton).toBeTruthy();
    expect(sendButton.tagName).toBe("BUTTON");

    // Check for Tooltip content
    const tooltipContent = screen.getByTestId("tooltip-content");
    expect(tooltipContent).toBeTruthy();
    expect(tooltipContent.textContent).toBe("Start Research");
  });
});
