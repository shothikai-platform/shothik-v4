## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-04-12 - Mongoose `.lean()` ID Virtual Missing
**Learning:** Adding `.lean()` to Mongoose read queries optimizes performance by bypassing document hydration, but it also removes virtuals like the `.id` string representation of `._id`, which is frequently relied on by the frontend.
**Action:** Always manually map `.lean()` results to append `.id` (e.g., `id: obj._id.toString()`) to maintain API backward compatibility while still reaping the performance benefits.
