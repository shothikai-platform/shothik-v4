import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import ResearchContent from "../ResearchContent";

const dummyStore = configureStore({
  reducer: {
    researchCore: () => ({ isStreaming: false, isPolling: false }),
    researchChat: () => ({ currentChatId: "test-chat-id" }),
  },
});

describe("ResearchContent XSS Sanitization", () => {
  it("sanitizes malicious script tags and event handlers in research result without sources", async () => {
    const maliciousInput = '<script>alert("xss")</script><img src="invalid" onerror="alert(\'xss\')" />';
    const currentResearch = {
      result: maliciousInput,
    };

    const { container } = render(
      <Provider store={dummyStore}>
        <ResearchContent currentResearch={currentResearch} />
      </Provider>
    );

    // After mount, DOMPurify should sanitize the HTML content
    const imgEl = container.querySelector("img");
    expect(imgEl).not.toBeNull();
    expect(imgEl?.getAttribute("onerror")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
  });

  it("sanitizes malicious script tags while preserving data-reference attributes in research result with sources", async () => {
    const maliciousInputWithRef =
      'Research finding [1]. <script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const sources = [
      {
        reference: 1,
        title: "Test Source",
        url: "https://example.com",
      },
    ];
    const currentResearch = {
      result: maliciousInputWithRef,
      sources: sources,
    };

    const { container } = render(
      <Provider store={dummyStore}>
        <ResearchContent currentResearch={currentResearch} />
      </Provider>
    );

    const spanEl = container.querySelector(".reference-link");
    expect(spanEl).not.toBeNull();
    expect(spanEl?.getAttribute("data-reference")).toBe("1");
    expect(container.querySelector("script")).toBeNull();

    const imgEl = container.querySelector('img[src="x"]');
    if (imgEl) {
      expect(imgEl.getAttribute("onerror")).toBeNull();
    }
  });
});
