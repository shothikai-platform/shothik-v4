# Sentinel Journal

## 2024-05-22 - Cross-Site Scripting (XSS) Vulnerabilities in React Components
**Vulnerability:** Identified multiple instances of `dangerouslySetInnerHTML` being used with unsanitized input, specifically when rendering Markdown content via `marked` or direct HTML content.
**Learning:** React's `dangerouslySetInnerHTML` is a common vector for XSS if input isn't sanitized. Developers often assume libraries like `marked` sanitize output by default, which is not always the case (or depends on configuration).
**Prevention:** Always use a sanitization library like `dompurify` before passing string content to `dangerouslySetInnerHTML`. Enforce this via code review or linting rules if possible.
