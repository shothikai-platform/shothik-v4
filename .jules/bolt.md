## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-03-07 - React Component Optimization in Streaming UI
**Learning:** Frequent parent re-renders in streaming components (e.g., due to tab switching or unrelated state changes) can cause expensive child components to re-render unnecessarily, even if their props are stable or memoized internally.
**Action:** Use `React.memo` for components rendering large lists (like logs) and memoize derived calculations (like counts) in parent components to prevent O(N) operations on every render.
