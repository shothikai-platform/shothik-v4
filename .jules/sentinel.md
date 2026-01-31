## 2025-05-27 - IDOR in Research Chat Deletion
**Vulnerability:** The `DELETE /api/research/chat/delete_chat/[id]` endpoint allowed deleting any research chat by ID without checking if the authenticated user owned the chat.
**Learning:** While `get_my_chats` correctly implemented `userId` filtering, other CRUD endpoints like `delete_chat` (and likely others) missed this check, relying solely on the object ID.
**Prevention:** Enforce a pattern where all user-specific resource queries must include `{ userId: currentUser._id }` in the query filter, rather than just `_id`. Use `findOneAndDelete` or `findOne` with both IDs instead of `findById...`.
