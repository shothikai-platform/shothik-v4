import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import React from "react";
import GrammarIssueCard from "../index";

describe("GrammarIssueCard XSS Protection", () => {
  it("strips malicious HTML/script payloads from highlighted sentence output", async () => {
    const maliciousIssue = {
      sentence: "This is a <script>alert('xss')</script> test sentence with error.",
      error: "error",
      correct: "correction<img src=x onerror=alert(1)>",
      type: "Grammar",
    };

    const { container } = render(
      <GrammarIssueCard issue={maliciousIssue} isCollapsed={true} />
    );

    // Verify script tags and onerror attributes are removed
    expect(container.querySelector("script")).toBeNull();
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      expect(img.getAttribute("onerror")).toBeNull();
    });

    expect(container.innerHTML).not.toContain("alert('xss')");
  });
});
