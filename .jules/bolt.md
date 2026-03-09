## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Mocking Chained Mongoose Methods
**Learning:** When mocking chained Mongoose methods (like `find().sort().lean()`) in Vitest, placing `vi.fn()` declarations directly before `vi.mock()` throws a `ReferenceError` inside the mock factory.
**Action:** Use `vi.hoisted()` to declare the mock functions before returning them so they can be safely accessed inside `vi.mock()`.
