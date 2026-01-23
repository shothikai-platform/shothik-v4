import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeaderTitle from "../HeaderTitle";
import { vi, describe, it, expect, afterEach, beforeAll } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock dependencies
vi.mock("@/lib/utils", () => ({
  cn: (...args) => args.filter(Boolean).join(" "),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}));

describe("HeaderTitle", () => {
  it("has accessible download button with tooltip", async () => {
    const user = userEvent.setup();
    render(
      <HeaderTitle query="Test Query" researchItem={{ result: "test" }} />,
    );

    // Find the download button
    // We look for the image with alt "Download" which is inside the button
    const downloadImg = screen.getByAltText("Download");
    const button = downloadImg.closest("button");

    expect(button).not.toBeNull();

    // Check for aria-label on the button
    expect(button.getAttribute("aria-label")).toBe("Download options");

    // Check for tooltip interaction
    // Hover over button
    await user.hover(button);

    // Tooltip should be associated via aria-describedby when open
    await waitFor(() => {
      expect(button.getAttribute("aria-describedby")).not.toBeNull();
    });
  });
});
