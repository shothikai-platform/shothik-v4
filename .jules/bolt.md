## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2024-05-18 - Mongoose .lean() and Virtuals
**Learning:** Using `.lean()` on Mongoose queries significantly improves performance by returning plain JS objects, bypassing heavy document creation. However, `.lean()` strips default virtuals like `id`. If a frontend expects `id` instead of `_id`, applying `.lean()` without explicit mapping will break the API contract.
**Action:** Always map the results of a `.lean()` query (e.g., `id: obj._id.toString()`) in read-only endpoints if the `id` virtual or other virtuals are expected by the client.
