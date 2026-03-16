## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2024-05-17 - Mongoose .lean() strips virtuals
**Learning:** Adding `.lean()` to Mongoose queries is a great performance optimization for endpoints returning lists, but it strips virtuals like `id`. If the frontend relies on `id`, this can break the API contract.
**Action:** When adding `.lean()` to read-only endpoints, ensure you map the results to re-introduce any necessary fields like `id` (e.g., `results.map(doc => ({ ...doc, id: doc._id?.toString() }))`).
