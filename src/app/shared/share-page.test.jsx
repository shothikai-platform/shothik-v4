import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SharedContentPage from "./[contentType]/[shareId]/page";

// Mock Next.js navigation hooks
const mockUseParams = vi.fn(() => ({
  contentType: "research",
  shareId: "test-share-id",
}));

vi.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Copy: () => <span data-testid="icon-copy" />,
  Download: () => <span data-testid="icon-download" />,
}));

// Mock UI components
vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children }) => <div data-testid="ui-alert">{children}</div>,
  AlertDescription: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, onClick }) => (
    <span data-testid="ui-badge" onClick={onClick}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }) => (
    <button data-testid="ui-button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr data-testid="ui-separator" />,
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <div data-testid="ui-spinner">Loading...</div>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  TooltipTrigger: ({ children }) => <div>{children}</div>,
  TooltipContent: ({ children }) => <div>{children}</div>,
  TooltipProvider: ({ children }) => <div>{children}</div>,
}));

describe("SharedContentPage XSS Sanitization", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
  });

  it("should sanitize malicious HTML payload in research content and keep safe elements", async () => {
    mockUseParams.mockReturnValue({
      contentType: "research",
      shareId: "test-research-xss",
    });

    const maliciousResearchPayload = {
      data: {
        shareId: "test-research-xss",
        contentType: "research",
        content: {
          title: "Research Title with XSS Test",
          query: "XSS Test",
          content: "<p>This is safe research content.</p><script>alert('XSS Script executed')</script><img src=\"x\" onerror=\"alert('XSS Image executed')\" /><span data-reference=\"1\">[1]</span>",
          sources: [
            { title: "Source 1", url: "https://example.com/1" }
          ]
        },
        permissions: { isPublic: true, allowDownload: true },
        currentViews: 10,
        createdAt: new Date().toISOString()
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => maliciousResearchPayload
    });

    render(<SharedContentPage />);

    // Wait for loader to disappear and content to render
    await waitFor(() => {
      expect(screen.queryByTestId("ui-spinner")).toBeNull();
    });

    const titleElement = await screen.findByText("Research Title with XSS Test");
    expect(titleElement).toBeTruthy();

    const safeText = screen.getByText("This is safe research content.");
    expect(safeText).toBeTruthy();

    // Verify the HTML container rendering. We expect standard tags are safe,
    // but malicious scripting tags and event attributes are completely stripped.
    const htmlContainer = safeText.parentElement;
    expect(htmlContainer).toBeDefined();

    const containerInnerHtml = htmlContainer.innerHTML;

    // The script tag must be completely removed
    expect(containerInnerHtml).not.toContain("<script>");
    expect(containerInnerHtml).not.toContain("XSS Script executed");

    // The onerror handler of img tag must be stripped
    expect(containerInnerHtml).not.toContain("onerror");
    expect(containerInnerHtml).not.toContain("XSS Image executed");

    // The safe image tag and custom data-reference attribute must be preserved
    expect(containerInnerHtml).toContain('<img src="x">');
    expect(containerInnerHtml).toContain('data-reference="1"');
  });

  it("should sanitize malicious HTML payload in document content and keep safe elements", async () => {
    mockUseParams.mockReturnValue({
      contentType: "document",
      shareId: "test-document-xss",
    });

    const maliciousDocumentPayload = {
      data: {
        shareId: "test-document-xss",
        contentType: "document",
        content: {
          title: "Document Title with XSS Test",
          content: "<div><h4>Heading 4</h4><p>Safe document text.</p><iframe src=\"javascript:alert('iframe xss')\"></iframe><a href=\"javascript:alert('link xss')\">malicious link</a></div>"
        },
        permissions: { isPublic: true, allowDownload: false },
        currentViews: 5,
        createdAt: new Date().toISOString()
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => maliciousDocumentPayload
    });

    render(<SharedContentPage />);

    await waitFor(() => {
      expect(screen.queryByTestId("ui-spinner")).toBeNull();
    });

    const titleElement = await screen.findByText("Document Title with XSS Test");
    expect(titleElement).toBeTruthy();

    const safeText = screen.getByText("Safe document text.");
    expect(safeText).toBeTruthy();

    const htmlContainer = safeText.parentElement;
    const containerInnerHtml = htmlContainer.innerHTML;

    // iframe with javascript protocol should be stripped or modified to be safe
    expect(containerInnerHtml).not.toContain("<iframe");
    expect(containerInnerHtml).not.toContain("iframe xss");

    // javascript href on links must be stripped
    expect(containerInnerHtml).not.toContain("javascript:alert");
  });
});
