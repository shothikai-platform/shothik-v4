## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Vitest Mocking Mongoose .lean() Chains
**Learning:** When mocking multiple Mongoose methods (like `findById` and `findOne`) that both chain `.lean()`, sharing a single `mockLean` hoisted function causes test cases to overwrite each other's expected values.
**Action:** Assign independent `.lean()` mock functions to each query mock in Vitest.
