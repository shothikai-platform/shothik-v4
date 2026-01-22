## 2025-05-23 - IDOR in Next.js Route Handlers
**Vulnerability:** Insecure Direct Object Reference (IDOR) in `delete_chat` and other chat endpoints.
**Learning:** Route handlers in Next.js receiving `params` do not automatically validate ownership. Relying on `findByIdAndDelete` with just the ID allows any user to delete any resource.
**Prevention:** Always use `getAuthenticatedUser` to retrieve the current user and include `userId` in the database query (e.g., `findOneAndDelete({ _id: id, userId: user._id })`) to enforce ownership at the database level.
