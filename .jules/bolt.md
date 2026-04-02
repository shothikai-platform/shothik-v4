## 2026-01-22 - Mongoose `.lean()` Optimization
**Learning:** When using Mongoose `.lean()` to optimize read-heavy queries by skipping document hydration, Mongoose strips virtual fields like `id`. This breaks frontend expectations if it relies on `id` instead of `_id`.
**Action:** Always map over `.lean()` results to explicitly add `id: obj._id.toString()` to maintain API contracts.

## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
