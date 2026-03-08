## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-03-08 - Optimize get_one_chat endpoint
**Learning:** Mongoose queries that retrieve a single document (like `findOne`) for read-only purposes without `.lean()` incur performance overhead due to Mongoose internal object mapping and tracking. Returning plain JS objects is faster and reduces memory consumption.
**Action:** Add `.lean()` to read-only queries (like `find`, `findOne`, `findById`) fetching Mongoose documents for APIs to minimize memory impact. When writing tests to mock queries ending in `.lean()`, ensure the query mock itself resolves to a mocked `.lean()` object.
