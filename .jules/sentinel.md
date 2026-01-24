## 2024-05-23 - IDOR in Next.js API Routes
**Vulnerability:** Insecure Direct Object References (IDOR) were found in Research Chat API endpoints (`get_one_chat`, `delete_chat`, `update_name`). The endpoints accepted an ID and performed operations without verifying if the resource belonged to the authenticated user.
**Learning:** Next.js API routes do not automatically enforce ownership. `findById` is dangerous when dealing with user-owned resources.
**Prevention:** Always use `getAuthenticatedUser()` to retrieve the current user and include `userId` in the database query (e.g., `findOne({ _id: id, userId: user._id })`) to enforce ownership at the database level.
