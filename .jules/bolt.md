## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - .lean() API Contract Considerations
**Learning:** While using `.lean()` on Mongoose `.find()` queries is an excellent performance optimization for read-only endpoints, it strips away Mongoose virtuals like `.id`.
**Action:** When implementing `.lean()`, always verify if the frontend expects `.id` instead of `._id`. If so, explicitly map the results to retain `id: doc._id.toString()` to avoid breaking the API contract.
