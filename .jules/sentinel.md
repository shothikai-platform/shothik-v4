## 2024-05-22 - Missing Ownership Checks in API Routes
**Vulnerability:** Found IDOR in `get_one_chat` where resource ownership is not validated against the session user.
**Learning:** The application uses `getAuthenticatedUser()` but does not consistently apply ownership filters (e.g., `userId: user.id`) when fetching individual resources by ID.
**Prevention:** Always combine `findById(id)` with an ownership check (e.g., `chat.userId === user.id`) or use `findOne({ _id: id, userId: user.id })`.
