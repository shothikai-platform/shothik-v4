## 2026-01-28 - IDOR in API Routes
**Vulnerability:** Found `DELETE` routes (e.g., `delete_chat`) that accessed database records using only the object ID provided in URL parameters, without checking the authenticated user's ownership of that object.
**Learning:** API routes using `findById` or `findByIdAndDelete` are unsafe by default for user-scoped resources.
**Prevention:** Always use `getAuthenticatedUser` and filter queries by `userId` (e.g., `findOne({ _id: id, userId: user.id })`) for user-specific data.
