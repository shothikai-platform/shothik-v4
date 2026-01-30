## 2024-05-22 - IDOR in Delete Chat API
**Vulnerability:** The `DELETE /api/research/chat/delete_chat/[id]` endpoint lacked authentication and authorization checks, allowing any user to delete any chat via `findByIdAndDelete`.
**Learning:** API routes using dynamic IDs (`[id]`) must explicitly validate ownership. `findByIdAndDelete` is dangerous in multi-tenant contexts.
**Prevention:** Always use `findOneAndDelete({ _id: id, userId: currentUser._id })` for user-owned resources and enforce authentication.
