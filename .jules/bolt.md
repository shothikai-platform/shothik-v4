## 2025-05-21 - Broken Build due to Truncated Code
**Learning:** The codebase contained syntax errors in `ResearchContentWithReferences.jsx` and `ReferenceModal.jsx` (truncated lines looking like unfinished object literals or logging statements) which caused the Next.js dev server and build to fail.
**Action:** Always check the build status or run a quick verification script before assuming the codebase is in a working state. Fix syntax errors immediately as they block all verification.
