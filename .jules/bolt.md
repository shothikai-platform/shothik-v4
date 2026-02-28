## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-01-23 - Performance Optimization with .lean()
**Learning:** Missing `.lean()` in Mongoose list endpoints fetches unnecessary full Mongoose documents, which wastes memory and slows down JSON serialization.
**Action:** Audit all `find()` queries in list endpoints to ensure they use `.lean()` if only read operations are performed.
