## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-03-14 - Safe to use .lean() on SheetSession
**Learning:** The `SheetSession` schema does not use virtuals or custom JSON transforms, making it completely safe to apply `.lean()` to its queries for significant performance gains when returning lists.
**Action:** Confidently use `.lean()` on any read-only query for `SheetSession` to optimize data serialization.
