import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CategoryTabs } from "./CategoryTabs";
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

describe("CategoryTabs", () => {
  const mockProps = {
    categories: ["All", "Technology", "Design"],
    activeCategory: "All",
    onCategoryChange: vi.fn(),
    sortBy: "newest" as const,
    onSortChange: vi.fn(),
    viewMode: "grid" as const,
    onViewModeChange: vi.fn(),
  };

  it("renders categories as buttons with correct accessibility attributes", () => {
    render(<CategoryTabs {...mockProps} />);

    // Check if the tabs are rendered as buttons
    const allButton = screen.getByRole("button", { name: "All" });
    const techButton = screen.getByRole("button", { name: "Technology" });

    expect(allButton).toBeDefined();
    expect(allButton.getAttribute("type")).toBe("button");
    expect(techButton).toBeDefined();
    expect(techButton.getAttribute("type")).toBe("button");
  });

  it("renders view mode toggle with correct aria-label", () => {
    render(<CategoryTabs {...mockProps} />);

    const buttons = screen.getAllByRole("button");
    const viewModeButton = buttons.find((btn) =>
        btn.getAttribute('aria-label') === "Switch to list view" ||
        btn.getAttribute('aria-label') === "Switch to grid view"
    );
    expect(viewModeButton).toBeDefined();
    expect(viewModeButton?.getAttribute('aria-label')).toBe("Switch to list view");
  });
});
