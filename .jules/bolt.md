## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2025-03-27 - [Optimize Mongoose Query Lists]
**Learning:** In Mongoose, returning full documents for list/index endpoints is a major performance bottleneck due to deep instantiation and virtual field tracking. Using `.lean()` efficiently resolves this by returning POJOs, but uniquely strips out the `.id` virtual (mapped from `_id`).
**Action:** Always append `.lean()` to Mongoose list-fetching queries. Explicitly map over the response to inject `id: item._id.toString()` manually, preventing breaking frontend contracts that rely on the `id` field.
