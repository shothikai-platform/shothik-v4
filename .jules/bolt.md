## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2024-05-19 - Mongoose Read-Only Queries
**Learning:** For read-only queries like `get_my_chats`, adding `.lean()` skips Mongoose document hydration. This drastically improves performance, as plain JavaScript objects are created and serialized much faster than Mongoose documents. Combined with proper user-scoped queries, it ensures optimal backend efficiency and resolves potential IDOR vulnerabilities.
**Action:** Use `.lean()` whenever fetching data from MongoDB that will purely be serialized or read, and does not require Mongoose-specific lifecycle hooks (like `save()` or virtual properties).
