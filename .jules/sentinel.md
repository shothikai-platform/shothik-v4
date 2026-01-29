
## 2025-02-17 - IDOR in Research Chat
**Vulnerability:** The `get_one_chat` endpoint allowed accessing any chat by ID without checking the `userId`.
**Learning:** `findById` alone is insufficient for user-scoped resources. Authentication does not imply authorization for a specific resource.
**Prevention:** Always use `findOne({ _id: id, userId: currentUser.id })` for user-specific resources, or explicitly check ownership after fetching.
