import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import SharedContentPage from "./[contentType]/[shareId]/page";
import React from "react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({
    contentType: "research",
    shareId: "test-share-id",
  }),
}));

// Mock components that might be problematic in test environment
vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("SharedContentPage Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true
    });

    // Mock global fetch
    global.fetch = vi.fn();
  });

  it("sanitizes malicious HTML in research content", async () => {
    const maliciousContent = "Hello <script>alert('xss')</script><img src=x onerror=alert('xss')> world";
    const shareData = {
      data: {
        shareId: "test-share-id",
        contentType: "research",
        content: {
          title: "Malicious Research",
          content: maliciousContent,
        },
        permissions: { allowDownload: true },
        createdAt: new Date().toISOString(),
      }
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => shareData,
    });

    render(<SharedContentPage />);

    // Wait for content to load and effect to run (isMounted)
    const contentElement = await screen.findByText(/Hello/);
    expect(contentElement).toBeInTheDocument();

    const htmlContent = contentElement.closest('div')?.innerHTML;

    // Script tag should be removed
    expect(htmlContent).not.toContain("<script>");
    // onerror attribute should be removed
    expect(htmlContent).not.toContain("onerror");
    // The image tag itself might remain depending on DOMPurify config, but without the payload
    expect(htmlContent).toContain("Hello");
    expect(htmlContent).toContain("world");
  });
});
