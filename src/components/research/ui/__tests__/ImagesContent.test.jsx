import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, test, vi, afterEach } from "vitest";
import ImagesContent from "../ImagesContent";
import React from "react";

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, onClick }) => <div onClick={onClick}>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }) => <span>{children}</span>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  ExternalLink: () => (
    <span data-testid="external-link-icon">ExternalLink</span>
  ),
  Image: () => <span data-testid="image-icon">Image</span>,
}));

// Mock Tooltip components for easy testing
vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
  TooltipContent: ({ children }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
}));

describe("ImagesContent Component", () => {
  afterEach(() => {
    cleanup();
  });

  const mockImages = [
    {
      _id: "1",
      title: "Test Image",
      url: "https://example.com/image.jpg",
      thumbnail_url: "https://example.com/thumb.jpg",
      source: "Example Source",
      width: 100,
      height: 100,
      context_url: "https://example.com/context",
    },
  ];

  test("renders image card with external link button", () => {
    render(<ImagesContent images={mockImages} />);

    // Check if image card is rendered
    expect(screen.getByText("Test Image")).toBeTruthy();

    // Check if external link button is rendered
    // The button has the ExternalLink icon
    const icon = screen.getByTestId("external-link-icon");
    const button = icon.closest("button");
    expect(button).toBeTruthy();
  });

  test("external link button has accessible label and tooltip", () => {
    render(<ImagesContent images={mockImages} />);

    const icon = screen.getByTestId("external-link-icon");
    const button = icon.closest("button");

    // Verify aria-label
    expect(button.getAttribute("aria-label")).toBe("Open source in new tab");

    // Verify tooltip structure
    expect(screen.getByTestId("tooltip")).toBeTruthy();

    // Check that button is inside trigger
    const trigger = screen.getByTestId("tooltip-trigger");
    expect(trigger.contains(button)).toBe(true);

    // Check tooltip text
    const content = screen.getByTestId("tooltip-content");
    expect(content.textContent).toBe("Open source");
  });
});
