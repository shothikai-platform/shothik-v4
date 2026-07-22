## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-27 - [Broken Object Level Authorization and Missing Auth on Research Chat Modifiers]
**Vulnerability:** The delete and rename (update_name) endpoints for ResearchChat allowed unauthenticated execution and deleted/updated resources without checking user ownership, exposing the application to IDOR and unauthorized resource modification.
**Learning:** Resource-modifying endpoints (PUT/DELETE) must be protected with the exact same level of authentication and ownership checks (using findOneAndUpdate/findOneAndDelete scoped to the current user's ID) as retrieval endpoints.
**Prevention:** Always wrap all endpoints in `getAuthenticatedUser()` checks, scope database updates and deletes using `{ _id: id, userId: user._id || user.id }`, and validate input payloads (e.g. string length checks) before database actions.
