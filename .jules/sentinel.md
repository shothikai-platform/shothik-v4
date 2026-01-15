## 2024-05-22 - Missing Auth & IDOR in API Routes
**Vulnerability:** Research Chat API endpoints (`get_one_chat`, `delete_chat`, `update_name`) completely lacked `getAuthenticatedUser()` checks and ownership validation.
**Learning:** Next.js Middleware configured in `src/middleware.ts` was not protecting `/api` routes (only `/dashboard`), leading to a false sense of security.
**Prevention:** Always verify authentication explicitly in every API route handler or ensure Middleware matcher covers all sensitive paths (including `/api`). Use `findOne({ _id: id, userId: user._id })` pattern instead of `findById(id)`.
