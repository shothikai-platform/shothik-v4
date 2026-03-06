## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Optimize Mongoose Read-Only Queries
**Learning:** Found Mongoose `find` queries in read-only API routes (e.g., `SheetSession.find()`) returning full documents instead of plain JavaScript objects, increasing memory usage and processing overhead.
**Action:** Always append `.lean()` to Mongoose read queries (`find`, `findOne`, `findById`) in API endpoints that do not require document mutations (like `.save()`), serialization logic, or virtual getters.
