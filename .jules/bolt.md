## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2024-03-24 - Performance optimization in ResearchStreamingShell
**Learning:** `ResearchStreamingShell` dynamically calculates `sourceCount` and `imageCount` on every render by iterating through the potentially large `streamEvents` array. This is O(N) calculation happening on every single state change (e.g. `selectedTab`, `titleCharCount`).
**Action:** Use `useMemo` to memoize the calculation of derived data from arrays, ensuring it only recalculates when `streamEvents` actually changes.
