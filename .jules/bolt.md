## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - .lean() with Mongoose Virtuals
**Learning:** Using `.lean()` on Mongoose queries strips default virtuals like `id`. If the frontend contract expects `id`, this breaks the application.
**Action:** Always map the results of `.lean()` to manually restore virtual properties like `id: doc._id.toString()` to maintain API contracts while gaining performance.
