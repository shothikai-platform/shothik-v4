## 2025-03-04 - [IDOR and Authentication Bypass in delete_chat Endpoint]
**Vulnerability:** Unauthenticated users could perform arbitrary deletion of other users' research chat histories via the `DELETE /api/research/chat/delete_chat/[id]` endpoint.
**Learning:** Overlooking authentication checks (`getAuthenticatedUser()`) on state-changing API endpoints is a critical risk. Even if database find operations check permissions, direct actions like `findByIdAndDelete(id)` execute changes regardless of session.
**Prevention:** Enforce strict session checks on every single state-changing endpoint and scope DB mutations utilizing compound queries or `findOneAndDelete({ _id: id, userId })`.

## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
