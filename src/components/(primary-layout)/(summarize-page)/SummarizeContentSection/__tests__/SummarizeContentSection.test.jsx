import { describe, expect, it } from "vitest";

describe("SummarizeContentSection Safe Text Extraction", () => {
  it("should extract plain text from HTML safely using DOMParser", () => {
    const extractTextFromHTML = (html) => {
      if (!html) return "";
      if (typeof window === "undefined") return "";
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return doc.body.textContent || "";
    };

    const inputHtml = "<p>Hello <strong>world</strong>!</p>";
    expect(extractTextFromHTML(inputHtml)).toBe("Hello world!");
  });

  it("should strip malicious script and XSS tags safely without execution", () => {
    let scriptExecuted = false;
    window.testXSS = () => {
      scriptExecuted = true;
    };

    const extractTextFromHTML = (html) => {
      if (!html) return "";
      if (typeof window === "undefined") return "";
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return doc.body.textContent || "";
    };

    const maliciousHtml = '<img src="x" onerror="window.testXSS()"><svg onload="window.testXSS()"></svg>Safe Text';
    const extracted = extractTextFromHTML(maliciousHtml);

    expect(scriptExecuted).toBe(false);
    expect(extracted).toBe("Safe Text");

    delete window.testXSS;
  });
});
