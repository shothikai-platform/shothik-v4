import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import ResearchProcessLogs from "./ResearchProcessLogs";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Badge component
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }) => (
    <span data-testid="badge" className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

// Mock Card components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }) => <div className={className}>{children}</div>,
}));

// Mock Separator component
vi.mock("@/components/ui/separator", () => ({
  Separator: ({ className }) => <hr className={className} />,
}));

describe("ResearchProcessLogs", () => {
  const mockStreamEvents = [
    {
      step: "queued",
      timestamp: new Date().toISOString(),
      data: { message: "Starting research..." },
    },
    {
      step: "web_research",
      timestamp: new Date().toISOString(),
      data: {
        sources_gathered: [{ url: "https://example.com", title: "Example Source" }],
        sources_count: 1,
      },
    },
    {
      step: "completed",
      timestamp: new Date().toISOString(),
      data: { result: "Research complete." },
    },
  ];

  it("renders correctly with stream events", () => {
    render(<ResearchProcessLogs streamEvents={mockStreamEvents} />);

    // Check if main title is rendered
    expect(screen.getByText("Research Process")).toBeDefined();

    // Check if steps are rendered
    expect(screen.getByText("Queued")).toBeDefined();
    expect(screen.getByText("Web research")).toBeDefined();
    expect(screen.getByText("Completed")).toBeDefined();

    // Check if source count badge is rendered (use getAllByText because it might appear multiple times)
    const sourceBadges = screen.getAllByText("1 sources");
    expect(sourceBadges.length).toBeGreaterThan(0);
  });

  it("renders sources in the preview block", () => {
    render(<ResearchProcessLogs streamEvents={mockStreamEvents} />);

    expect(screen.getByText("Example Source")).toBeDefined();
    // example.com might be split or formatted differently in the component
    // The component does: new URL(s.url).hostname.replace("www.", "")
    expect(screen.getByText("example.com")).toBeDefined();
  });

  it("handles empty stream events gracefully", () => {
    const { container } = render(<ResearchProcessLogs streamEvents={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("updates when streamEvents prop changes (React.memo check)", () => {
    const { rerender } = render(<ResearchProcessLogs streamEvents={mockStreamEvents} />);
    expect(screen.getAllByText("1 sources").length).toBeGreaterThan(0);

    const newEvents = [
      ...mockStreamEvents,
      {
        step: "image_search",
        timestamp: new Date().toISOString(),
        data: { images_found: 2 },
      },
    ];

    rerender(<ResearchProcessLogs streamEvents={newEvents} />);
    expect(screen.getByText("Image search")).toBeDefined();
    expect(screen.getByText("2 images")).toBeDefined();
  });
});
