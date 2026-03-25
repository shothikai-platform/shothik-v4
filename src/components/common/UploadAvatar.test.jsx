import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import UploadAvatar from "./UploadAvatar";

// Mock next/image to avoid errors during rendering
vi.mock("next/image", () => ({
  default: (props) => <img {...props} />,
}));

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

describe("UploadAvatar", () => {
  it("renders with a hidden input that is screen-reader only", () => {
    const onDropMock = vi.fn();
    render(<UploadAvatar file={null} onDrop={onDropMock} loading={false} />);

    // Find the file input
    const fileInput = screen.getByLabelText("Upload Photo", {
      selector: "input",
    });
    expect(fileInput).toBeDefined();

    // Verify it uses sr-only for accessibility rather than being completely hidden from the DOM
    expect(fileInput.className).toContain("sr-only");
    expect(fileInput.className).not.toContain("hidden");
  });

  it("renders the label element correctly with focus styles", () => {
    const onDropMock = vi.fn();
    render(<UploadAvatar file={null} onDrop={onDropMock} loading={false} />);

    // In testing-library, getByLabelText on the text will get the input
    // To get the label itself, we find the text
    const labelText = screen.getByText("Upload Photo");
    const labelElement = labelText.closest("label");

    expect(labelElement).toBeDefined();
    expect(labelElement.className).toContain("focus-within:ring-2");

    // Verify it uses htmlFor correctly matching the input ID
    const fileInput = screen.getByLabelText("Upload Photo", {
      selector: "input",
    });
    expect(labelElement.getAttribute("for")).toBe(fileInput.id);
  });
});
