## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-03-01 - Mongoose lean() Query Optimization
**Learning:** Mongoose queries without `.lean()` return heavyweight Mongoose Documents which consume more memory and CPU for hydration, even when only read-only JSON representation is needed.
**Action:** Add `.lean()` to read-only queries (like list/get endpoints) to optimize performance, returning plain JavaScript objects instead of Mongoose Documents.
