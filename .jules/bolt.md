## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2025-03-09 - Performance: Mongoose Queries in Read-Only Endpoints
**Learning:** Returning large collections of Mongoose documents in API endpoints without converting them adds massive serialization and memory overhead, as the default `find()` operation attaches internal states, getters, and setters to each document that are instantly discarded by `NextResponse.json()`. In the Sheet Sessions API, fetching all sessions (which could be numerous) exacerbates this.
**Action:** Always append `.lean()` to Mongoose queries (like `find`, `findOne`, `findById`) in read-only Next.js route handlers to return plain JavaScript objects, unless Mongoose virtuals or `.save()` methods are explicitly required. Ensure proper mocks (`{ lean: vi.fn() }`) are configured in Vitest tests for the optimized endpoints.
