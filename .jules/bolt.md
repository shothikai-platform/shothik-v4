## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-01-22 - API Response Optimization in Sheet Session
**Learning:** Returning full Mongoose documents for list endpoints is unnecessarily heavy, adding serialization overhead and increasing memory consumption.
**Action:** Adding `.lean()` to query chains (`SheetSession.find().lean()`) in read-only routes significantly speeds up query execution, as plain JavaScript objects are much lighter than full Mongoose document instances. Check all `find` list routes to apply this pattern.
