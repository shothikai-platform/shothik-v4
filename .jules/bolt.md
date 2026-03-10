## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-03-10 - Mongoose Query Payload Optimization
**Learning:** Running Mongoose queries without `.lean()` builds heavy Mongoose objects unnecessarily, leading to substantial serialization overhead, especially in read-only API list endpoints.
**Action:** Use `.lean()` in all read-only Mongoose queries (like `find`, `findOne`, `findById`) for API endpoints to return plain JavaScript objects and improve performance.
