## 2024-05-22 - IDOR Vulnerability in Research Chat API
**Vulnerability:** The `get_one_chat` and `delete_chat` API endpoints fetched and returned/deleted chat documents based solely on the `id` parameter, without checking if the authenticated user owned that chat. This allowed any user to access or delete any other user's research chats by guessing the ID.
**Learning:** Next.js middleware in this project only protects specific routes (like `/dashboard`) and does not automatically enforce authentication or ownership on `/api` routes. Mongoose `ObjectId` comparison using strict equality (`===` or `!==`) against string IDs fails silently (returns true for inequality), leading to broken authorization logic if not handled correctly (e.g., using `.toString()`).
**Prevention:**
1.  **Explicit Auth Checks:** Every sensitive API route must manually call `getAuthenticatedUser()` and handle the `null` case (401 Unauthorized).
2.  **Ownership Validation:** After fetching a resource, explicitly verify that `resource.userId` matches `user._id`.
3.  **Type Safety:** Always convert Mongoose `ObjectId` fields to strings (`.toString()`) before comparing them with other string IDs to prevent type mismatch bugs.
