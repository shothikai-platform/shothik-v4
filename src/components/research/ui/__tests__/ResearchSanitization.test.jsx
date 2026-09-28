import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";
import ResearchContent from "../ResearchContent";

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    researchCore: () => ({ isStreaming: false, isPolling: false }),
    researchChat: () => ({ currentChatId: "test-chat-id" }),
  },
});

describe("ResearchContent XSS Sanitization", () => {
  it("sanitizes XSS payloads in markdown message content", () => {
    const maliciousPayload = `# Research Title\n\n<script>alert('xss')</script><img src="x" onerror="alert('xss')">Safe text content`;

    const currentResearch = {
      result: maliciousPayload,
      sources: [],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <ResearchContent currentResearch={currentResearch} />
      </Provider>
    );

    // Verify safe text is rendered
    expect(screen.getByText("Safe text content")).toBeDefined();

    // Verify script tags and onerror event attributes are removed
    expect(container.querySelector("script")).toBeNull();
    const img = container.querySelector("img");
    if (img) {
      expect(img.getAttribute("onerror")).toBeNull();
    }
  });
});
