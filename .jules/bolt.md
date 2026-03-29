## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-03-29 - Lean read-only endpoints
**Learning:** Using Mongoose '.lean()' in endpoints (like index actions) returns raw JS objects rather than Mongoose documents. This massively avoids getter/setter initialization and state tracking, significantly speeding up reads.
**Action:** Apply '.lean()' globally for any query that exclusively returns read-only JSON responses, but manually map virtuals (e.g., '_id' to 'id') when doing so.
