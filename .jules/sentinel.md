## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-15 - Missing Authentication and IDOR in Destructive Actions
**Vulnerability:** The `delete_chat` API endpoint lacked authentication and used `findByIdAndDelete(id)`, allowing unauthenticated users to delete any user's chat by ID.
**Learning:** Destructive operations like deletes or updates must always verify user identity and enforce ownership boundaries, especially when primary keys (IDs) are guessable or exposed.
**Prevention:** Use `getAuthenticatedUser()` to ensure the request is authenticated, and replace `findByIdAndDelete` with `findOneAndDelete({ _id: id, userId: user._id })` to inherently verify ownership during the operation.
