## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-04-21 - API Response Optimization with lean()
**Learning:** Returning a large list of sessions directly from Mongoose creates significant overhead from document instantiation when only raw data is needed for list endpoints.
**Action:** Always append `.lean()` to list queries to bypass document instantiation, but remember to explicitly map internal `_id` fields to `id` if the frontend expects it, as `.lean()` bypasses virtuals.
