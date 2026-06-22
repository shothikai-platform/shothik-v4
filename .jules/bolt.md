## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Optimizing Mongoose queries in tests
**Learning:** When adding `.lean()` to standard Mongoose queries, tests that mock those queries (like `findOne`) must be updated to return an object with a `lean` function (e.g., `mockFindOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(data) })`), otherwise the tests will fail with a `TypeError: ...lean is not a function`.
**Action:** Always verify if there are corresponding tests that mock the modified Mongoose queries and update their return values to support the `.lean()` method chain.
