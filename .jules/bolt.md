## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Mongoose Performance Tuning
**Learning:** When using Mongoose `.lean()` to optimize query performance by returning plain JS objects instead of Mongoose documents, virtual properties (like the `id` getter) are lost.
**Action:** Always map over `.lean()` query results to explicitly reconstruct necessary virtual fields (e.g., `id: doc._id.toString()`) to prevent breaking components that rely on them.

## 2026-01-22 - Scope Adherence during Optimization
**Learning:** Attempting to fix an unrelated security vulnerability (IDOR) while implementing a performance optimization (`.lean()`) fundamentally alters the endpoint's behavior and risks breaking existing unauthenticated clients.
**Action:** Never alter underlying business logic, query conditions, or introduce new authentication boundaries during a performance optimization task, even if a vulnerability is apparent.
