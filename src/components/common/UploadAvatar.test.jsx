import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, vi, afterEach } from "vitest";
import UploadAvatar from "./UploadAvatar";
import React from 'react';
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("next/image", () => ({
  default: (props) => <img {...props} />,
}));

test("renders UploadAvatar and handles focus correctly", () => {
  render(<UploadAvatar onDrop={() => {}} />);

  // Find the file input
  const fileInput = document.querySelector('input[type="file"]');
  expect(fileInput).toBeDefined();

  // It should be screen-reader only instead of hidden
  expect(fileInput.className).toContain("sr-only");

  // Find the label wrapper
  const label = document.querySelector('label');
  expect(label).toBeDefined();

  // Label should have focus styles
  expect(label.className).toContain("focus-within:ring-2");
});

test("shows uploaded image when file prop is provided", () => {
  const testImageUrl = "https://example.com/test.jpg";
  render(<UploadAvatar file={testImageUrl} onDrop={() => {}} />);

  const img = screen.getByAltText("avatar");
  expect(img).toBeDefined();
  expect(img.src).toContain("test.jpg");
});
