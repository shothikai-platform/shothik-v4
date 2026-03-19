## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Missing Virtuals with Mongoose .lean()
**Learning:** Using Mongoose `.lean()` on list endpoints improves performance, but it removes default virtual getters like `id`. If the frontend consumes `id` instead of `_id`, this causes a breaking contract change.
**Action:** When converting read queries to `.lean()`, explicitly map `session => ({ ...session, id: session._id.toString() })` to retain expected virtuals without pulling in plugins like `mongoose-lean-virtuals`.
