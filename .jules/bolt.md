## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Mongoose Document Hydration
**Learning:** When using Mongoose without `.lean()`, the returned results are heavy Mongoose Documents that impact performance by taking up memory with internal state methods. However, simply adding `.lean()` will strip virtual getters (like `id` defaulting to `_id`).
**Action:** When adding `.lean()` for performance optimization on Mongoose read queries, you must explicitly map the results to add any expected virtual fields back (e.g., `id: doc._id.toString()`) to prevent breaking API contracts.