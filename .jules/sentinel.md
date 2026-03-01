## 2024-05-18 - Prevent IDOR in Chat Deletion
**Vulnerability:** The `DELETE /api/research/chat/delete_chat/[id]` endpoint accepted an unauthenticated request to delete any chat ID provided in the path parameters using `findByIdAndDelete(id)`.
**Learning:** Next.js Route Handlers do not inherently check authentication; endpoints directly mutating Mongoose models by ID without validating the authenticated user context lead to Insecure Direct Object Reference (IDOR).
**Prevention:** Always wrap database mutations in authenticated context checks (`getAuthenticatedUser()`) and use scoped database methods like `findOneAndDelete({ _id: id, userId: user._id })` instead of `findByIdAndDelete(id)`.
