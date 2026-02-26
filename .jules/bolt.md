## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-02-18 - IDOR and Performance Fix in Sheet Chats
**Learning:** The `get_my_chats` endpoint for Sheets was fetching *all* sessions without user scoping or field selection, causing a massive data leak and performance bottleneck.
**Action:** Always verify `get_my_chats` endpoints scope by `userId` and use `.select()` to exclude heavy fields. Added tests to enforce this.
