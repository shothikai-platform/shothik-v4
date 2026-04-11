## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Mongoose Lean API Contract
**Learning:** Adding `.lean()` to Mongoose queries strips virtuals, breaking the API contract if the frontend expects `id` instead of `_id`.
**Action:** When adding `.lean()`, explicitly map `_id` to `id` (e.g., `id: obj._id?.toString()`) to preserve API compatibility.
