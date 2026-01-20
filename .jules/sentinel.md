## 2025-02-23 - Research Chat IDOR Vulnerability
**Vulnerability:** Insecure Direct Object Reference (IDOR) in Research Chat API.
**Learning:** API routes (`get_one_chat`, `delete_chat`, `update_name`) were accessible by any user, allowing unauthorized access and modification of other users' research chats. The application relied on client-side routing or obscurity of IDs, which is insufficient.
**Prevention:** Always enforce server-side authentication (`getAuthenticatedUser`) and authorization checks (comparing `userId` from the resource with the authenticated user's ID) in every API route handling user-specific data. Use `findOne({ _id: id, userId: user.id })` pattern.
