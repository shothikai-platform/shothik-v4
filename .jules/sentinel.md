## 2025-02-19 - IDOR in Next.js API Routes
**Vulnerability:** Research Chat API endpoints (`get_one_chat`, `delete_chat`, `update_name`) used `findById` with user-supplied IDs without checking ownership against the authenticated user.
**Learning:** In Next.js App Router API handlers, `params` are easily accessible but auth middleware doesn't automatically scope DB queries. Explicit `userId` filtering is required in every query.
**Prevention:** Always use `findOne({ _id: id, userId: currentUser.id })` instead of `findById(id)` for user-owned resources.
