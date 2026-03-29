import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import UploadAvatar from "./UploadAvatar";

vi.mock("next/image", () => ({
  default: (props) => <img {...props} />,
}));

describe("UploadAvatar Accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render a semantically linked label and accessible file input", () => {
    render(<UploadAvatar onDrop={vi.fn()} loading={false} />);

    // Verify the file input is keyboard-focusable (using sr-only rather than hidden)
    const fileInput = screen.getByLabelText(/Upload Photo/i);
    expect(fileInput).toBeDefined();

    // Check that it's actually an input type="file"
    expect(fileInput.tagName).toBe("INPUT");
    expect(fileInput.type).toBe("file");

    // Ensure it uses 'sr-only' for screen reader accessibility instead of 'hidden'
    expect(fileInput.className).toContain("sr-only");
    expect(fileInput.className).not.toContain("hidden");
  });

  it("should have focus-within styles on the label wrapper", () => {
    render(<UploadAvatar onDrop={vi.fn()} loading={false} />);

    // In our implementation, the label doesn't have the text directly,
    // the text is inside a span. But we can still find the input by label
    // and then find its parent container.
    const fileInput = screen.getByLabelText(/Upload Photo/i);
    const labelElement = fileInput.closest("label");

    expect(labelElement).toBeDefined();
    expect(labelElement.className).toContain("focus-within:ring-2");
    expect(labelElement.className).toContain("focus-within:ring-ring");
  });
});
