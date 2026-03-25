## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-01-22 - API Endpoint Lean Virtuals
**Learning:** Using `.lean()` on Mongoose queries returns plain objects but strips default virtuals like `id`. If the frontend depends on `id` instead of `_id`, simply using `.lean()` without mapping will break the API contract.
**Action:** Always map the results of `.lean()` queries to retain essential virtuals, e.g., `id: obj._id.toString()`, when `.lean()` is used on endpoints that previously returned full hydrated Document instances.
