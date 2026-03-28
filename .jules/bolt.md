## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2024-05-24 - Mongoose .lean() Requires ID Mapping
**Learning:** Using Mongoose `.lean()` on read-only API endpoints provides significant performance improvements by returning plain JS objects instead of heavy Mongoose documents. However, `.lean()` strips default Mongoose virtuals, including `.id`. If the frontend API contract relies on `.id` instead of `._id`, using `.lean()` directly will break functionality.
**Action:** Always map results (e.g., `id: obj._id.toString()`) to retain expected virtuals and avoid breaking API contracts when implementing `.lean()` optimization.
