import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    return "";
  }

  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["span"],
    ADD_ATTR: ["data-reference", "class", "target"],
    USE_PROFILES: { html: true }, // Ensure we only allow HTML, not SVG/Math if not needed, but default is usually safe.
  });
}
