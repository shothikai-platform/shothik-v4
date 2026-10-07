import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import ResearchContent from "../ResearchContent";
import ResearchContentWithReferences from "../../../tools/research/ResearchContentWithReferences";

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    researchChat: () => ({ currentChatId: "test-chat-id" }),
    researchCore: () => ({ isStreaming: false, isPolling: false }),
  },
});

describe("Research XSS Sanitization", () => {
  it("sanitizes malicious script tags and onerror handlers in ResearchContent", async () => {
    const maliciousPayload = `<script>alert('xss')</script><img src="x" onerror="alert(1)" />Safe Text`;

    const { container } = render(
      <Provider store={mockStore}>
        <ResearchContent
          currentResearch={{ result: maliciousPayload }}
          isLastData={true}
        />
      </Provider>
    );

    expect(container.querySelector("script")).toBeNull();
    const imgEl = container.querySelector("img");
    expect(imgEl).not.toBeNull();
    expect(imgEl?.getAttribute("onerror")).toBeNull();
    expect(screen.getByText("Safe Text")).toBeDefined();
  });

  it("sanitizes malicious payload while maintaining reference tags in ResearchContentWithReferences", async () => {
    const maliciousPayload = `<script>alert('xss')</script>Check reference [1] <img src="x" onerror="alert(1)">`;
    const sources = [{ reference: 1, title: "Source 1", url: "https://example.com" }];

    const { container } = render(
      <ResearchContentWithReferences
        content={maliciousPayload}
        sources={sources}
      />
    );

    expect(container.querySelector("script")).toBeNull();
    const imgEl = container.querySelector("img");
    expect(imgEl).not.toBeNull();
    expect(imgEl?.getAttribute("onerror")).toBeNull();

    // Check that reference attribute is preserved for safe interactive features
    const refSpan = container.querySelector('[data-reference="1"]');
    expect(refSpan).not.toBeNull();
    expect(refSpan?.getAttribute("data-reference")).toBe("1");
  });
});
