## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-06-12 - [IDOR and Missing Auth in Research Chat Update]
**Vulnerability:** `update_name` endpoint allowed unauthenticated users to change any chat's name by ID.
**Learning:** Forgetting `getAuthenticatedUser()` is a critical oversight. Even with auth, using `findByIdAndUpdate` without a `userId` filter leads to IDOR.
**Prevention:** Every write operation on user-owned data MUST first call `getAuthenticatedUser()` and then use the user's ID in the filter criteria of the update/delete query.
