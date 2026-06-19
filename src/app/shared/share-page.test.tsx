import { render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi, describe, beforeEach } from "vitest";
import SharedContentPage from "./[contentType]/[shareId]/page";
import React from "react";
import "@testing-library/jest-dom/vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({
    contentType: "research",
    shareId: "test-share-id",
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock components that might use window or other browser APIs not fully available in jsdom
vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

describe("SharedContentPage Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("should sanitize malicious HTML in research content", async () => {
    const maliciousPayload = "<img src=x onerror=alert(1)> <script>alert('xss')</script>";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          contentType: "research",
          content: {
            title: "Malicious Research",
            content: maliciousPayload,
          },
          permissions: { allowDownload: true },
          currentViews: 0,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    render(<SharedContentPage />);

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText("Malicious Research")).toBeInTheDocument();
    }, { timeout: 2000 });

    // Wait for sanitized content to be rendered (it happens in a second useEffect)
    let contentContainer;
    await waitFor(() => {
      contentContainer = document.querySelector('div[class*="text-foreground"][class*="text-base"]');
      expect(contentContainer).not.toBeNull();
    }, { timeout: 2000 });

    if (contentContainer) {
       // Check that script tag is NOT present
       expect(contentContainer.innerHTML).not.toContain("<script>");
       // Check that onerror attribute is NOT present
       expect(contentContainer.innerHTML).not.toContain("onerror");
    }
  });
});
