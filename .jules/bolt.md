## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2025-03-04 - Mongoose Query Optimization with .lean()
**Learning:** Returning full Mongoose documents from queries like `findOne` or `find` in read-only API endpoints is a performance bottleneck. It causes unnecessary overhead because Mongoose instantiates heavy document instances, keeping track of internal state and validations which aren't needed just to return JSON.
**Action:** Always append `.lean()` to Mongoose read queries (`find`, `findOne`, `findById`) in read-only API endpoints to return plain JavaScript objects, significantly reducing memory overhead and execution time.
