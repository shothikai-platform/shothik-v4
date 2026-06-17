import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SharedContentPage from "./[contentType]/[shareId]/page";
import { useParams } from "next/navigation";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
};
global.sessionStorage = mockSessionStorage as any;

describe("SharedContentPage Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as any).mockReturnValue({ contentType: "research", shareId: "test-share" });
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  it("sanitizes malicious HTML content", async () => {
    const maliciousContent = "<div>Safe Content</div><img src=x onerror=alert('XSS')>";
    const mockData = {
      success: true,
      data: {
        contentType: "research",
        content: {
          title: "Test Research",
          content: maliciousContent,
        },
        permissions: { isPublic: true },
        createdAt: new Date().toISOString(),
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { container } = render(<SharedContentPage />);

    // Wait for the content to be loaded and sanitized
    await waitFor(() => {
      expect(screen.queryByText("Loading article...")).toBeNull();
    });

    // Check that the safe content is present
    expect(screen.queryByText("Safe Content")).not.toBeNull();

    // Check that the malicious onerror attribute is stripped
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("onerror")).toBeNull();
  });
});
