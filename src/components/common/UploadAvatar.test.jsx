import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import UploadAvatar from "./UploadAvatar";

describe("UploadAvatar", () => {
  it("renders input with sr-only class and forwards focus to parent label", () => {
    const handleFileChange = vi.fn();
    render(<UploadAvatar fileChange={handleFileChange} />);

    // Get the file input by its label or ID
    const input = document.getElementById("avatarInput");

    // Ensure it's in the document and has sr-only class
    expect(input).toBeDefined();
    expect(input.className).toContain("sr-only");
    expect(input.className).not.toContain("hidden"); // Ensure we removed 'hidden'

    // Simulate focus
    fireEvent.focus(input);

    // The label is what wraps the input and should have the focus-within styling
    const label = input.closest("label");
    expect(label.className).toContain("focus-within:ring-2");
  });
});
