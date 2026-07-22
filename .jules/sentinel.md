## 2025-02-23 - [Refactor dangerouslySetInnerHTML]
**Vulnerability:** XSS vulnerability through usage of `dangerouslySetInnerHTML` for simple text highlighting logic based on regular expressions.
**Learning:** `String.prototype.split(regex)` with a capturing group in the regex (`(escapedWord)`) can split the text while preserving the matching parts. The resulting array can then be mapped directly to React JSX elements to apply formatting. React automatically escapes strings, effectively mitigating XSS risks without requiring external sanitization libraries or complex HTML string processing.
**Prevention:** Avoid `dangerouslySetInnerHTML` when formatting text. Prefer mapping text segments to native React elements.
