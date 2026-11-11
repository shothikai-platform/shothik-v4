## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2024-05-18 - Optimized get_my_chats Route
**Learning:** Found an opportunity to improve JSON serialization performance in Next.js API routes by bypassing Mongoose document mapping using `.lean()`.
**Action:** Added `.lean()` to the `SheetSession.find({}).sort({ updatedAt: -1 })` query in `src/app/api/sheet/chat/get_my_chats/route.ts` to return a plain JS object array instead of heavy Mongoose documents.
