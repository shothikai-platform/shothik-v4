## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2025-03-12 - [Performance: Mongoose read queries]
**Learning:** For Mongoose read-only operations, returning full documents includes significant overhead (getters, setters, change tracking). The `get_one_chat` endpoint was returning unoptimized Mongoose documents.
**Action:** Always chain `.lean()` onto `.find()` or `.findOne()` for read-only API endpoints to return plain JavaScript objects and improve performance, reducing serialization overhead.
