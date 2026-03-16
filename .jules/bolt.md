## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-03-16 - Lean Read Optimization
**Learning:** Returning full Mongoose documents from read-only endpoints incurs significant memory and processing overhead.
**Action:** Always append `.lean()` to Mongoose queries like `find()`, `findOne()`, and `findById()` in read-only API endpoints to return plain JavaScript objects, unless Mongoose virtuals or document methods are strictly required.
