## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2024-05-18 - API Response Optimization for Sheet Sessions
**Learning:** Found that `/api/sheet/chat/get_my_chats` endpoint was returning full Mongoose documents for lists, which is a performance bottleneck.
**Action:** Always use `.lean()` on Mongoose read-only list endpoints to return plain JS objects, significantly reducing memory and CPU overhead.
