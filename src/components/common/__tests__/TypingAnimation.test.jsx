import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import TypingAnimation from "../TypingAnimation";

describe("TypingAnimation", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with default text", () => {
    render(<TypingAnimation />);
    expect(screen.getByText("Thinking...")).toBeDefined();
  });

  it("renders with custom text", () => {
    render(<TypingAnimation text="Loading..." />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("has correct accessibility attributes", () => {
    const { container } = render(<TypingAnimation />);

    // Check for role="status" and aria-live="polite"
    // This will fail initially because the role is not present
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeDefined();
    expect(statusRegion.getAttribute("aria-live")).toBe("polite");

    // Check that dots container is hidden
    const hiddenContainer = container.querySelector('[aria-hidden="true"]');
    expect(hiddenContainer).not.toBeNull();
  });
});
