import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import WebSearch from "../WebSearch";

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <span data-testid="chevron-left">Left</span>,
  ChevronRight: () => <span data-testid="chevron-right">Right</span>,
  ChevronDownIcon: () => <span data-testid="chevron-down-icon">Down</span>,
  X: () => <span data-testid="close-icon">X</span>,
  Globe: () => <span data-testid="globe-icon">Globe</span>,
  Search: () => <span data-testid="search-icon">Search</span>,
  ExternalLink: () => (
    <span data-testid="external-link-icon">ExternalLink</span>
  ),
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
}));

// Mock useIsMobile hook
vi.mock("@/hooks/ui/useMobile", () => ({
  useIsMobile: () => false,
}));

// Mock motion/react-client
vi.mock("motion/react-client", () => ({
  div: ({ children, ...props }) => <div {...props}>{children}</div>,
  button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

// Mock next/image if used (it's not used directly, but good practice)
vi.mock("next/image", () => ({
  default: (props) => <img {...props} />,
}));

const mockData = {
  images: [
    { url: "img1.jpg", description: "Description 1" },
    { url: "img2.jpg", description: "Description 2" },
  ],
  results: [
    {
      title: "Result 1",
      url: "https://example.com/1",
      content: "Content 1",
      published_date: "2023-01-01",
    },
  ],
  queries: ["query1"],
};

describe("WebSearch Component Accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders image grid items as accessible buttons", () => {
    render(<WebSearch data={mockData} />);

    // Find all image grid items
    // Assuming they are rendered as buttons or have role="button"
    const imageButtons = screen.queryAllByRole("button", {
      name: /Description/i,
    });

    // In the current implementation (before fix), they are likely just divs with onClick, so this might fail or return nothing if they don't have role="button"
    // If they are divs, we can search by image alt text, but we want to verify they are BUTTONS.

    // Now check if they are wrapped in a button with proper aria-label
    // This expectation is what we want to PASS after the fix.
    // For now, it might fail.

    // Verify each image is inside a button
    mockData.images.forEach((img) => {
      const button = screen.queryByRole("button", { name: img.description });
      expect(button).not.toBeNull();
    });
  });

  it("renders navigation buttons with aria-labels in ImageViewer modal", () => {
    render(<WebSearch data={mockData} />);

    // Click the first image button to open the modal
    const firstButton = screen.getByRole("button", { name: "Description 1" });
    fireEvent.click(firstButton);

    // Now modal should be open (mocked desktop view)
    // Check for "Previous image" and "Next image" buttons
    const prevButton = screen.getByLabelText("Previous image");
    const nextButton = screen.getByLabelText("Next image");

    expect(prevButton).not.toBeNull();
    expect(nextButton).not.toBeNull();
  });
});
