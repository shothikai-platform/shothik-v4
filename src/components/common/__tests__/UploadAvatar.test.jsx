import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import UploadAvatar from "../UploadAvatar";

// Mock next/image since it's not supported in jsdom
vi.mock("next/image", () => ({
  default: (props) => <img {...props} />,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Camera: (props) => <div data-testid="camera-icon" {...props} />,
}));

describe("UploadAvatar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders correctly with default state", () => {
    render(<UploadAvatar onDrop={vi.fn()} />);

    // Check for text
    expect(screen.getByText("Upload Photo")).toBeTruthy();

    // Check for input
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    expect(input.className).toContain("sr-only");

    // Verify association
    const label = input.closest("label");
    expect(label).toBeTruthy();
    expect(label.htmlFor).toBe(input.id);
  });

  it("renders with existing file", () => {
    const fileUrl = "https://example.com/avatar.jpg";
    render(<UploadAvatar file={fileUrl} onDrop={vi.fn()} />);

    const image = screen.getByAltText("avatar");
    expect(image).toBeTruthy();
    expect(image.src).toBe(fileUrl);
  });

  it("handles file drop/change", () => {
    const onDrop = vi.fn();
    render(<UploadAvatar onDrop={onDrop} />);

    const input = document.querySelector('input[type="file"]');
    const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onDrop).toHaveBeenCalledWith(file);
  });

  it("shows error state", () => {
    render(<UploadAvatar error={true} onDrop={vi.fn()} />);

    const label = document.querySelector("label");
    expect(label.className).toContain("border-destructive");
  });

  it("shows loading state and disables input", () => {
    render(<UploadAvatar loading={true} onDrop={vi.fn()} />);

    const input = document.querySelector('input[type="file"]');
    expect(input.disabled).toBe(true);

    const label = input.closest("label");
    expect(label.className).toContain("cursor-not-allowed");
  });

  it("displays helper text", () => {
    const helperText = "Image must be under 5MB";
    render(<UploadAvatar helperText={helperText} onDrop={vi.fn()} />);

    expect(screen.getByText(helperText)).toBeTruthy();
  });
});
