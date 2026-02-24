import React from "react";
import { render, screen } from "@testing-library/react";
import ResearchProcessLogs from "./ResearchProcessLogs";
import { describe, it, expect } from "vitest";

describe("ResearchProcessLogs", () => {
  const mockEvents = [
    {
      step: "queued",
      timestamp: Date.now(),
      data: { title: "Test Research" },
    },
    {
      step: "web_research",
      timestamp: Date.now(),
      data: {
        sources_gathered: [{ title: "Source 1", url: "https://example.com" }],
      },
    },
  ];

  it("renders correctly", () => {
    render(<ResearchProcessLogs streamEvents={mockEvents} />);
    expect(screen.getByText("Queued")).toBeTruthy();
    expect(screen.getByText("Web research")).toBeTruthy();
  });

  it("renders source links with appropriate accessibility attributes", () => {
    render(<ResearchProcessLogs streamEvents={mockEvents} />);
    // Select all links and find the one that matches our source
    const links = screen.getAllByRole("link");
    const sourceLink = links.find(
      (link) => link.getAttribute("href") === "https://example.com",
    );

    expect(sourceLink).toBeTruthy();
    expect(sourceLink.getAttribute("target")).toBe("_blank");
    expect(sourceLink.getAttribute("rel")).toBe("noopener noreferrer");

    // Check for aria-label
    const expectedAriaLabel = "Source 1 (opens in new tab)";
    expect(sourceLink.getAttribute("aria-label")).toBe(expectedAriaLabel);

    // Verify list structure for timeline
    // There might be multiple lists, so we look for the one we added class to
    const lists = screen.getAllByRole("list");
    const timelineList = lists.find((l) => l.classList.contains("list-none"));

    expect(timelineList).toBeTruthy();

    // Check items within this list
    const listItems = timelineList.querySelectorAll("li");
    expect(listItems.length).toBe(2);
  });
});
