## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2024-03-07 - Vitest Mocking for Chained Mongoose Methods (.lean())
**Learning:** When testing Mongoose queries that use `.lean()` optimization (e.g., `Model.findOne().lean()`) in a Vitest environment, mocking the resolved value directly on `mockFindOne` will cause `.lean()` to be undefined and break tests. Attempting to return an object with a newly created mock (`{ lean: vi.fn() }`) and referencing the inner mock (`mockLean.mockResolvedValue(...)`) can also cause tests to fail or become brittle if not setup properly for chaining.
**Action:** The most robust way to mock chained Mongoose methods like `.lean()` when they are expected to resolve the final value is to return the mocked resolved value directly from the `lean` function in the chain: `mockFindOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) })`. This properly simulates the chaining behavior without complicating the test file's hoisted mock declarations.
