## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2024-03-02 - Safely optimizing get_one_chat with .lean()
**Learning:** Adding `.lean()` to Mongoose queries like `findOne` bypasses Mongoose document hydration and `toJSON`/`toObject` transformations, which improves performance. However, this optimization can break API contracts if the schema relies on those transformations (e.g., stripping `__v`, changing `_id` to `id`). `ResearchChat` schema does not use custom transformations, making `.lean()` safe here. Furthermore, updating Vitest mocks for `.lean()` requires ensuring the mock still handles cases correctly when chained (`mockReturnValue({ lean: mockLean })`).
**Action:** Always inspect the target Mongoose schema for `toJSON` or `toObject` options before applying `.lean()` to an existing endpoint to ensure the API payload contract remains unbroken. When mocking `.lean()` in tests, provide a default mock setup using `vi.hoisted` that accurately reflects the chained behavior.
