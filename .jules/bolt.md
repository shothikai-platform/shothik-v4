## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2024-05-17 - Mongoose find and findOne Lean Optimization
**Learning:** Using `.lean()` on Mongoose `.find()` and `.findOne()` queries in read-only Next.js API endpoints significantly reduces memory consumption and speeds up response times by bypassing the heavy instantiation of Mongoose Document objects.
**Action:** Always append `.lean()` to Mongoose queries in `GET` endpoints where the result is simply serialized to JSON via `NextResponse.json()` and no document manipulation (like `.save()`) is required.
