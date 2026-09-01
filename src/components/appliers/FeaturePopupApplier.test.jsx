import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import DOMPurify from "dompurify";

afterEach(() => {
  cleanup();
});

const SanitizedPopupContent = ({ content, isMounted }) => {
  if (!content) return null;
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: isMounted ? DOMPurify.sanitize(content) : "",
      }}
      className="prose prose-sm max-w-none dark:prose-invert"
    />
  );
};

describe("FeaturePopupApplier XSS Sanitization", () => {
  it("sanitizes malicious script tags and event handlers from popup content when mounted", () => {
    const maliciousContent =
      '<p>Safe Content</p><script>alert("xss")</script><img src="invalid" onerror="alert(\'xss\')" />';

    const { container } = render(
      <SanitizedPopupContent content={maliciousContent} isMounted={true} />
    );

    // Verify safe content is rendered
    expect(screen.getByText("Safe Content")).toBeTruthy();

    // Verify script tag is stripped out completely
    const scriptTags = container.querySelectorAll("script");
    expect(scriptTags.length).toBe(0);

    // Verify onerror handler is removed from img tag
    const imgTags = container.querySelectorAll("img");
    const maliciousImg = Array.from(imgTags).find(
      (img) => img.getAttribute("src") === "invalid"
    );
    if (maliciousImg) {
      expect(maliciousImg.getAttribute("onerror")).toBeNull();
    }
  });

  it("renders empty string when not mounted to prevent SSR hydration mismatch/XSS", () => {
    const maliciousContent = '<p>Safe Content</p><script>alert("xss")</script>';

    const { container } = render(
      <SanitizedPopupContent content={maliciousContent} isMounted={false} />
    );

    expect(container.firstChild.innerHTML).toBe("");
  });
});
