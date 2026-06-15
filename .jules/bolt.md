## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.
## 2026-01-22 - Vitest Mocking of Mongoose Chainable Methods
**Learning:** When mocking Mongoose queries that use chainable functions like `.lean()` in Vitest (e.g., `findOne().lean()`), ensure the base mock returns an object containing the `.lean` function (e.g., `mockFindOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(data) })`) rather than directly resolving a value on the base function, to prevent type mismatches and 'is not a function' test failures.
**Action:** Always structure mock returns to mirror the full chain of methods used in the implementation, especially for ORMs like Mongoose.
