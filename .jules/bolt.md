## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-03-18 - Mongoose Read-Only Query Optimization
**Learning:** Returning full Mongoose documents in read-only API endpoints (like lists) incurs unnecessary memory and CPU overhead.
**Action:** Always append `.lean()` to Mongoose queries (e.g., `find()`, `findOne()`, `findById()`) in endpoints that only serialize the data to JSON and do not require Mongoose instance methods (like `.save()`).
