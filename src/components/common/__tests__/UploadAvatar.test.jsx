import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import UploadAvatar from "../UploadAvatar";

describe("UploadAvatar Component Accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the file input with correct accessibility attributes", () => {
    render(<UploadAvatar onDrop={vi.fn()} />);

    const input = screen.getByLabelText("Upload avatar photo");
    expect(input).toBeDefined();

    // Check if the input is sr-only
    expect(input.className).toContain("sr-only");
    expect(input.type).toBe("file");
  });

  it("renders the label wrapper correctly for keyboard interaction", () => {
    render(<UploadAvatar onDrop={vi.fn()} />);

    // Since the label wraps the input, checking for the input's presence
    // implies the label's association works. We can check for the label element indirectly
    // by ensuring our focus-visible class exists on the parent
    const input = screen.getByLabelText("Upload avatar photo");
    const label = input.closest("label");

    expect(label).toBeDefined();
    expect(label.className).toContain("has-[:focus-visible]:ring-2");
  });
});