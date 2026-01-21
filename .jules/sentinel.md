## 2024-05-24 - Unsanitized Markdown Rendering
**Vulnerability:** XSS vulnerability found in `ResearchContent` components where `marked` output was directly passed to `dangerouslySetInnerHTML`.
**Learning:** `marked` does not sanitize HTML by default. Rendering markdown from untrusted sources (or AI) without sanitization allows injection of malicious scripts.
**Prevention:** Always use `isomorphic-dompurify` to sanitize HTML before rendering it with `dangerouslySetInnerHTML` in React components, especially when using `marked`.
