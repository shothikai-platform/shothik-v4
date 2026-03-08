## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-03-08 - Optimize Mongoose Read Queries with .lean()
**Learning:** Calling `.lean()` on Mongoose `find()` queries for read-only endpoints (like fetching all chats/sessions) significantly reduces memory overhead and execution time because it bypasses the heavy Mongoose Document hydration process and returns plain JavaScript objects.
**Action:** Always append `.lean()` (or `.lean({ virtuals: true })` if ID mapping is needed) to `find()`, `findOne()`, or `findById()` queries in GET endpoints that simply return data to the client.
