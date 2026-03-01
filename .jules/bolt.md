## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2025-02-28 - Derived Streaming Metrics Optimization
**Learning:** In React components that receive frequent updates like real-time streaming arrays (`streamEvents`), O(N) array loops to compute derived values like `sourceCount` and `imageCount` on every render can cause measurable performance blocking on the main thread.
**Action:** Always wrap these derived metrics using `useMemo` so that they are only recalculated when the streaming array dependency actually changes, rather than on every extraneous re-render.
