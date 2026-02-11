## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-27 - [IDOR in Delete Chat API & User ID Handling]
**Vulnerability:** `delete_chat` endpoint allowed deletion of any chat by ID due to missing ownership check and authentication.
**Learning:** `getAuthenticatedUser` returns a user object where the ID property can be inconsistent (`_id` vs `id`). Security checks must handle both to avoid bypasses or errors.
**Prevention:** Use `userId: user._id || user.id` when querying Mongoose models to ensure the user ID is correctly matched regardless of the underlying auth provider's format.
