import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import ResearchContent from "../ResearchContent";

vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => ({})),
}));

vi.mock("@/redux/slices/researchChatSlice", () => ({
  researchChatState: () => ({}),
}));

vi.mock("@/redux/slices/researchCoreSlice", () => ({
  researchCoreState: () => ({}),
}));

vi.mock("@/components/tools/research/CombinedActions", () => ({
  default: () => <div data-testid="combined-actions" />,
}));

vi.mock("@/components/tools/research/SourcesGrid", () => ({
  default: () => <div data-testid="sources-grid" />,
}));

vi.mock("@/components/tools/research/ReferenceModal", () => ({
  default: () => <div data-testid="reference-modal" />,
}));

describe("ResearchContent XSS Sanitization", () => {
  it("sanitizes malicious script tags and onerror attributes in ResearchContent", () => {
    const maliciousResearch = {
      result: "Safe text <script>console.log('xss')</script><img src=\"x\" onerror=\"console.log('xss')\" />",
      sources: [],
    };

    const { container } = render(
      <ResearchContent currentResearch={maliciousResearch} isLastData={false} />
    );

    // Verify script element is completely stripped from DOM
    expect(container.querySelector("script")).toBeNull();

    // If img element exists, verify onerror attribute is stripped
    const img = container.querySelector("img");
    if (img) {
      expect(img.hasAttribute("onerror")).toBe(false);
    }
  });

  it("preserves data-reference attributes on reference links while sanitizing XSS in ResearchContentWithReferences", () => {
    const maliciousResearchWithSources = {
      result: "Check this <script>alert(1)</script> reference [1]",
      sources: [{ reference: 1, title: "Source 1", url: "https://example.com" }],
    };

    const { container } = render(
      <ResearchContent currentResearch={maliciousResearchWithSources} isLastData={false} />
    );

    // Verify script tag is removed
    expect(container.querySelector("script")).toBeNull();

    // Verify citation span data-reference is retained
    const refSpan = container.querySelector("span[data-reference='1']");
    expect(refSpan).not.toBeNull();
    expect(refSpan?.getAttribute("data-reference")).toBe("1");
  });
});
