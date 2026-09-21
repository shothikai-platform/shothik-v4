import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ResearchContent from "@/components/research/ui/ResearchContent";

// Mock redux hooks since ResearchContent uses useSelector
vi.mock("react-redux", () => ({
  useSelector: (selector: any) =>
    selector({
      researchCore: { isStreaming: false, isPolling: false },
      researchChat: { currentChatId: "test-chat-id" },
    }),
}));

describe("ResearchContent XSS Sanitization", () => {
  it("sanitizes malicious script tags and inline handlers in message content", async () => {
    const maliciousInput = `# Research Header\nSafe text\n<script>alert('xss')</script>\n<img src="invalid" onerror="alert('xss')" />`;

    const currentResearch = {
      result: maliciousInput,
      sources: [],
    };

    const { container } = render(
      <ResearchContent currentResearch={currentResearch} isLastData={false} />
    );

    // Verify normal markdown heading is rendered
    expect(screen.getByText("Research Header")).toBeDefined();
    expect(screen.getByText("Safe text")).toBeDefined();

    // Verify malicious script tags and onerror handlers are stripped out
    expect(container.querySelector("script")).toBeNull();

    const img = container.querySelector("img");
    if (img) {
      expect(img.getAttribute("onerror")).toBeNull();
    }
  });
});
