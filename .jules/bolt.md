## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Opting for .lean() on read-only queries
**Learning:** Found that `SheetSession.find({}).sort({ updatedAt: -1 })` in list endpoints was returning full Mongoose documents, which is unnecessary when immediately serializing via `NextResponse.json`.
**Action:** Chain `.lean()` to Mongoose list-fetching queries in read-only endpoints to improve performance by directly yielding plain JavaScript objects.
