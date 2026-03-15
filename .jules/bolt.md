## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-01-22 - SheetSession Fetch Optimization
**Learning:** Found an opportunity to optimize `SheetSession` retrieval in API endpoint `src/app/api/sheet/chat/get_my_chats/route.ts` by using `.lean()`.
**Action:** Implemented `.lean()` method on `SheetSession.find().sort({ updatedAt: -1 })` query, reducing processing time and memory overhead for returning read-only JSON data.
