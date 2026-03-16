import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import UploadAvatar from "./UploadAvatar";
import { cleanup } from "@testing-library/react";

// Add DOM matchers
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});

// Mock Next.js Image component
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("UploadAvatar Accessibility", () => {
  it("renders an accessible file input with an accessible label", () => {
    render(<UploadAvatar loading={false} onDrop={() => {}} />);

    // Check if the input is in the document and has an aria-label
    const input = screen.getByLabelText("Upload avatar");
    expect(input).toBeInTheDocument();

    // Input should be of type file
    expect(input).toHaveAttribute("type", "file");

    // Ensure the input is not using display:none (which hides from screen readers)
    // The class 'sr-only' is used to hide visually but keep accessible
    expect(input).toHaveClass("sr-only");
  });

  it("links the label wrapper to the input using htmlFor", () => {
    render(<UploadAvatar loading={false} onDrop={() => {}} />);

    // The text 'Upload Photo' is inside the label wrapper
    const labelWrapper = screen.getByText("Upload Photo").closest("label");
    expect(labelWrapper).toBeInTheDocument();
    expect(labelWrapper).toHaveAttribute("for", "avatarInput");
  });
});
