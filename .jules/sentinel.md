## 2024-05-22 - Research Chat IDOR
**Vulnerability:** IDOR in `delete_chat` API endpoint allowed unauthenticated/unauthorized users to delete any research chat by ID.
**Learning:** API routes were missing authentication and authorization checks. `findByIdAndDelete` was used without user scoping.
**Prevention:** Always verify `getAuthenticatedUser()` and use `userId` in database queries (e.g. `findOneAndDelete({ _id: id, userId: ... })`) for user-owned resources.
