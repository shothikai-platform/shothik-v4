## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Preserve Default Virtuals with .lean()
**Learning:** When adding `.lean()` to Mongoose read queries for performance optimization, default virtuals like `id` (the string representation of `_id`) are stripped from the resulting payload.
**Action:** Explicitly map the plain JS objects returned by `.lean()` to add the `id` field back (`id: obj._id.toString()`) to preserve the expected API contract for clients.
