import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import SharedContentPage from "./page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ contentType: "research", shareId: "test-share-id" }),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; },
    length: 0,
    key: (index) => null,
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe("SharedContentPage XSS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("sanitizes malicious links", async () => {
    const maliciousContent = "[danger](javascript:alert('xss'))";
    const mockShareData = {
      contentType: "research",
      content: {
        title: "Malicious Research",
        content: maliciousContent,
      },
      metadata: { createdAt: new Date().toISOString() },
      permissions: { allowDownload: true },
      currentViews: 0,
      createdAt: new Date().toISOString(),
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockShareData }),
    });

    const { container } = render(<SharedContentPage />);

    await waitFor(() => {
        expect(screen.queryByText("Malicious Research")).not.toBeNull();
    });

    const anchor = container.querySelector('a');
    expect(anchor).not.toBeNull();
    // DOMPurify should remove the javascript: href or set it to something safe
    const href = anchor?.getAttribute('href');
    expect(href === "" || href === null).toBe(true);
  });

  it("sanitizes malicious HTML tags", async () => {
    // Using a payload that marked should pass through as HTML
    const maliciousContent = "<div><img src=x onerror=alert(1)></div>";
    const mockShareData = {
      contentType: "research",
      content: {
        title: "Malicious Research 2",
        content: maliciousContent,
      },
      metadata: { createdAt: new Date().toISOString() },
      permissions: { allowDownload: true },
      currentViews: 0,
      createdAt: new Date().toISOString(),
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockShareData }),
    });

    const { container } = render(<SharedContentPage />);

    await waitFor(() => {
        expect(screen.queryByText("Malicious Research 2")).not.toBeNull();
    });

    const img = container.querySelector('img');
    if (img) {
        expect(img.getAttribute('onerror')).toBeNull();
    }
  });
});
