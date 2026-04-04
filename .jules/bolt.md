## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Markdown Parsing Bottleneck
**Learning:** `marked` parsing inside `ResearchContent` was running on every render. Since this component re-renders frequently during streaming (via Redux subscriptions), this caused significant CPU usage.
**Action:** Use `useMemo` for expensive text processing like markdown parsing, especially in components that re-render frequently due to unrelated state changes (like streaming status).
