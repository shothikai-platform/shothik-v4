## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR in Research Delete Chat API]
**Vulnerability:** `delete_chat/[id]` endpoint was unauthenticated and fetched chats solely by ID, allowing unauthorized users to delete anyone's research chats (IDOR).
**Learning:** Checking ownership and authentication is required not just for read/fetch endpoints, but even more so for destructive state-changing actions (e.g. DELETE).
**Prevention:** Always require authentication via `getAuthenticatedUser()` and delete with a query scoped to the user ID: `findOneAndDelete({ _id: id, userId: user._id || user.id })`.
