## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Default Virtual Serialization with .lean()
**Learning:** Adding `.lean()` to Mongoose queries strips default virtuals, such as the `id` field (which maps to `_id`). This can break frontend clients expecting `id` for keys or data fetching if the API directly returns the lean result.
**Action:** When adding `.lean()` to Mongoose queries, always explicitly map the result set to manually restore critical virtuals like `id: obj._id.toString()` before serializing the API response.
