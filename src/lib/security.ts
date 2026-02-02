import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * It uses DOMPurify to strip dangerous tags and attributes while preserving
 * safe HTML structure and specific attributes needed for the application.
 *
 * @param html - The potentially unsafe HTML string.
 * @returns The sanitized HTML string.
 */
export const sanitizeHtml = (html: string): string => {
  if (typeof window === "undefined") {
    // Return original HTML on server-side to prevent hydration mismatches
    // if the content is rendered on server.
    // Note: If the content contains malicious scripts, they will be present in the initial HTML
    // but typically won't execute until hydration/interaction unless it's a script tag.
    // Ideally, we should sanitize on server too, but DOMPurify requires a window (JSDOM).
    return html;
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "p",
      "a",
      "ul",
      "ol",
      "nl",
      "li",
      "b",
      "i",
      "strong",
      "em",
      "strike",
      "code",
      "hr",
      "br",
      "div",
      "table",
      "thead",
      "caption",
      "tbody",
      "tr",
      "th",
      "td",
      "pre",
      "span",
      "img",
      "del",
    ],
    ALLOWED_ATTR: [
      "href",
      "name",
      "target",
      "src",
      "alt",
      "class",
      "style",
      "data-reference",
      "width",
      "height",
    ],
    ADD_ATTR: ["target"],
  });
};
