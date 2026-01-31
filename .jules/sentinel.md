## 2025-05-15 - Missing Authentication and Ownership Checks in Research API
**Vulnerability:** Several API routes in `src/app/api/research/chat` (specifically `update_name` and `get_one_chat`) were found to rely on `findById` or `findByIdAndUpdate` using only the resource ID, without checking if the user is authenticated or if the resource belongs to them.
**Learning:** The default `dbConnect` and `Mongoose` model usage does not imply any authentication or authorization. Next.js API routes require explicit `getAuthenticatedUser()` checks and `userId` filters in database queries to prevent IDOR.
**Prevention:**
1. Always import and call `getAuthenticatedUser()` at the start of protected routes.
2. Use `findOne` / `findOneAndUpdate` / `findOneAndDelete` with `{ _id: id, userId: user._id }` instead of `findById...` methods.
3. Add unit tests that specifically attempt access without authentication and with cross-user IDs.
