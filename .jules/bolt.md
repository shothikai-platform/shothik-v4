## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-01-22 - Mocking Chained Mongoose Methods
**Learning:** When using `.lean()` with Mongoose queries in Next.js/Vitest endpoints, ensure *all* test cases that execute the query mock the entire chain (e.g., `mockFindOne.mockReturnValue({ lean: mockLean.mockResolvedValue(...) })`). Failure to do so will result in `TypeError: ...lean is not a function` in those tests.
**Action:** Before submitting, audit the test suite (using `vitest run <file>`) to ensure the updated mock implementation is universally applied to all cases within the test file touching the modified method.
