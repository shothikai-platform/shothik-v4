## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-03-18 - Prevent Full Table Scans in List Endpoints
**Learning:** The `SheetSession.find({})` query in a list endpoint caused a full database table scan and returned all users' data, creating a massive N+1-like performance bottleneck and security leak. Adding `.lean()` to Mongoose list endpoints significantly reduces memory footprint by returning plain JS objects.
**Action:** Always filter list endpoints by `userId` to prevent bounded performance degradation, and chain `.lean()` to read-only Mongoose queries to skip heavy document instantiation.
