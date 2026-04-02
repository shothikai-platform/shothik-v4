## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-23 - Lean Query Optimization and Virtuals
**Learning:** Adding `.lean()` to Mongoose read queries significantly improves performance and reduces memory usage for list endpoints by returning plain JavaScript objects. However, doing so strips default Mongoose virtuals like `id`.
**Action:** When using `.lean()` to optimize read queries, explicitly map over the results to add the `id` field back (`id: obj._id.toString()`) to preserve the expected API contract for clients relying on the `id` string field.
