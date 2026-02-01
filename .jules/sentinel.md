# Sentinel Journal

## 2024-05-22 - [CRITICAL] IDOR in Chat Deletion
**Vulnerability:** `src/app/api/research/chat/delete_chat/[id]/route.ts` allowed unauthenticated users to delete any chat by ID.
**Learning:** API routes handling sensitive operations (like DELETE) must explicitly verify authentication and resource ownership. `findByIdAndDelete` is dangerous without a preceding ownership check or scoped query.
**Prevention:** Always use `findOneAndDelete({ _id: id, userId: user._id })` pattern for user-scoped resources. Ensure `getAuthenticatedUser()` is called and validated at the start of the handler.
