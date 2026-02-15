## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Unoptimized List Endpoints
**Learning:** Found `get_my_chats` for `SheetSession` was fetching ALL sessions in the database without user filtering or `.lean()`, causing O(N) performance and IDOR.
**Action:** Audit all list endpoints to ensure they filter by `userId` and use `.lean()` for read-only operations.
