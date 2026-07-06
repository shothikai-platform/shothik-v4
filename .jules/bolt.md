## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2025-07-06 - Optimize mongoose queries
**Learning:** In Next.js serverless functions, Mongoose `.find()` and `.findOne()` return large object representations of documents. Returning plain objects with `.lean()` in read-only routes reduces memory usage and serialization time significantly.
**Action:** Whenever fetching Mongoose documents for read-only purposes (like returning in an API), chain `.lean()` to the query.
