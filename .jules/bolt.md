## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-04-01 - Mongoose Lean Optimization with Virtuals
**Learning:** When adding `.lean()` to Mongoose read queries for optimization, default virtuals such as `id` are stripped from the resulting payload.
**Action:** To preserve the expected API contract, explicitly map the results to add the `id` field back (e.g., `id: obj._id.toString()`).
