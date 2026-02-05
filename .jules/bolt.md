## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-02-27 - Unbounded Query Detection
**Learning:** Found `get_my_chats` endpoint fetching *all* sessions from the database without a `userId` filter. This is a severe scalability bottleneck (O(TotalUsers)) disguised as a simple fetch.
**Action:** Audit all "list" endpoints to ensure they strictly filter by `userId` in the initial query.
