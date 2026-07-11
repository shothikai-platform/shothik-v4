import React from "react";
import { cleanup, render, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ResearchContentWithReferences from "./ResearchContentWithReferences";

// Mock child components that we don't want to test
vi.mock("./CombinedActions", () => ({
  default: () => <div data-testid="combined-actions" />,
}));
vi.mock("./ReferenceModal", () => ({
  default: () => <div data-testid="reference-modal" />,
}));
vi.mock("./SourcesGrid", () => ({
  default: () => <div data-testid="sources-grid" />,
}));

describe("ResearchContentWithReferences Sanitization", () => {
  afterEach(() => {
    cleanup();
  });

  it("should sanitize malicious HTML in content", async () => {
    const maliciousContent = "Hello <script>alert('XSS')</script> world";
    const { container } = render(
      <ResearchContentWithReferences
        content={maliciousContent}
        sources={[]}
      />
    );

    // After mount, sanitization should have occurred
    const html = container.innerHTML;
    expect(html).toContain("Hello");
    expect(html).toContain("world");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert('XSS')");
  });

  it("should allow data-reference attribute on span tags", () => {
    const content = "Source [1]";
    const sources = [{ reference: 1, title: "Source 1", url: "http://example.com" }];

    const { container } = render(
      <ResearchContentWithReferences
        content={content}
        sources={sources}
      />
    );

    const html = container.innerHTML;
    expect(html).toContain('data-reference="1"');
    expect(html).toContain('class="reference-link');
  });

  it("should sanitize event handlers", () => {
    const maliciousContent = '<img src="x" onerror="alert(1)">';
    const { container } = render(
      <ResearchContentWithReferences
        content={maliciousContent}
        sources={[]}
      />
    );

    const html = container.innerHTML;
    expect(html).toContain('<img src="x">');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("alert(1)");
  });
});
