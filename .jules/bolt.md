## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-23 - Broken Console Log Removal
**Learning:** Found critical syntax errors in `ResearchContentWithReferences.jsx` and `ReferenceModal.jsx` caused by incomplete removal of `console.log` statements (leaving object literals hanging).
**Action:** When using automated scripts to remove logs, always verify the resulting syntax, especially for multi-line logs or object logging.

## 2026-01-23 - Vitest React Import Requirement
**Learning:** `vitest` (via `jsdom` environment) throws `ReferenceError: React is not defined` if React is not explicitly imported in JSX files, even if Next.js/React 17+ doesn't require it for build.
**Action:** Always verify `import React from 'react'` is present in components when writing or fixing tests, or configure `jsx: 'automatic'` in test config if possible.
