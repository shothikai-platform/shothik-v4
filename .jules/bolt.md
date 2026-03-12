## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-01-22 - Optimize Mongoose Read Queries\n**Learning:** Mongoose returning large document instances unnecessarily bloats memory usage on endpoints returning lists or heavy single objects (like chats/sessions).\n**Action:** Use `.lean()` to return plain JavaScript objects when hydration is not needed to optimize serialization and payload size.
