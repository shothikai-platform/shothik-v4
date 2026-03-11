## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2025-03-11 - Use .lean() on Mongoose queries for Read-Only API endpoints
**Learning:** Returning full Mongoose documents from read operations creates significant, unnecessary overhead during serialization to JSON.
**Action:** Always apply `.lean()` to `find()`, `findOne()`, and `findById()` queries in read-only API endpoints to return plain JS objects, conserving CPU time and memory.
