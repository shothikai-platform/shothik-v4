## 2025-02-28 - Fix Next.js "use client" directive placement with DOMPurify
**Vulnerability:** XSS vulnerability in multiple React components via unsanitized `dangerouslySetInnerHTML`.
**Learning:** When mitigating XSS vulnerabilities in Next.js applications using `isomorphic-dompurify`, automated replacement scripts (like `sed`) can accidentally prepend `import` statements at the very top of the file, above the `"use client";` directive. This triggers a critical Next.js compilation error, as `"use client"` must always be the very first statement.
**Prevention:** When injecting imports into Next.js components via automated scripts, explicitly check for and preserve the position of the `"use client";` directive, ensuring all new imports are placed below it.
