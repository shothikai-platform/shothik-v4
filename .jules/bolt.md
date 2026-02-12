## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-02-05 - Unbounded Collection Fetch
**Learning:** Found an endpoint (`sheet/chat/get_my_chats`) fetching the entire `SheetSession` collection without user filtering. This is a massive performance bottleneck and security risk (IDOR/Information Disclosure).
**Action:** Always verify that list endpoints filter by the authenticated user's ID and use database indexes.
