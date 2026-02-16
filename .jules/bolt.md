## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-02-09 - SheetSession List Optimization
**Learning:** Found `get_my_chats` endpoint fetching *all* sessions without user filtering, causing massive over-fetching and a security risk.
**Action:** Always filter list endpoints by `userId` and use `.lean()` for read-only operations to avoid hydrating heavy Mongoose documents.
