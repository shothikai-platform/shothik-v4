## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Mongoose Lean Optimization for List Endpoints
**Learning:** Mongoose read queries for lists (`find().sort()`) have significant memory overhead from instantiating full Mongoose documents. Using `.lean()` returns plain JS objects, significantly improving query performance. However, this strips default virtuals such as `id`, which can break existing API contracts.
**Action:** Use `.lean()` for performance optimization on read-only list endpoints, but always manually map the virtuals back (e.g., `id: obj._id.toString()`) to maintain expected API structure.
