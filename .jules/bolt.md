## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Mongoose Object Overhead in NextJS API Routes
**Learning:** Mongoose queries in NextJS API endpoints like `get_my_chats` suffer from significant overhead when serializing large arrays of Document instances to JSON.
**Action:** Always append `.lean()` to Mongoose `.find()` queries for read-only endpoints returning arrays of objects to NextJS frontend, returning plain JS objects. Check the frontend uses `._id` over `.id` before changing.
