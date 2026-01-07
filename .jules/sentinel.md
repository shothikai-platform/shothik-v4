## 2024-01-07 - Critical XSS Vulnerability in ResearchContent

**Vulnerability:**
The `ResearchContent` component (`src/components/research/ui/ResearchContent.jsx`) was taking `marked(message)` output and passing it directly to `dangerouslySetInnerHTML` without any sanitization.
This allowed any malicious script injected into the `message` (e.g., from an external LLM response or manipulated input) to be executed in the user's browser (XSS).

**Learning:**
`marked` version 0.7.0+ does not sanitize output by default. It assumes the input is trusted or that the output will be sanitized by another library.
React's `dangerouslySetInnerHTML` is named "dangerously" for a reason - it bypasses React's XSS protection.
Using `marked` directly with `dangerouslySetInnerHTML` is a common pattern that becomes vulnerable if `dompurify` is skipped.

**Prevention:**
Always use `dompurify` (or similar) to sanitize HTML before passing it to `dangerouslySetInnerHTML`.
Example: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(message)) }}`.
Ensure `dompurify` is installed and used in all components rendering markdown/HTML dynamically.
