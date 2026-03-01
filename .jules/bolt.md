## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-02-08 - Use .lean() in Mongoose read-only queries
**Learning:** Returning full Mongoose documents introduces unnecessary hydration overhead when the data is only read and returned as JSON (such as in `get_my_chats` or `get_one_chat` endpoints).
**Action:** Use `.lean()` in Mongoose read queries (like `find` and `findOne`) to return plain JavaScript objects, reducing memory footprint and improving response times.
