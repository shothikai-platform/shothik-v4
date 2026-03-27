## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - API Response Payload Optimization
**Learning:** Using `.lean()` on Mongoose queries is a major performance win for read-only endpoints, skipping document instantiation. However, it explicitly drops Mongoose virtuals. This can break API clients expecting virtual fields like `id`.
**Action:** When adding `.lean()` to list endpoints, explicitly map over the results to retain critical virtuals like `id` by calling `_id.toString()`.
