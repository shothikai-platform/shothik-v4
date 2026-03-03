## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-03-03 - Database Read Optimization
**Learning:** Using `.lean()` on single Mongoose read queries (like `findOne` or `findById`) for endpoints that only return the document without modifying it significantly improves execution speed and reduces memory usage, similar to its benefits on array responses like `find`.
**Action:** Always append `.lean()` to Mongoose queries in read-only API routes when the resulting documents don't require subsequent Mongoose specific methods (like `.save()` or getters/setters).
