## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-27 - [IDOR in Sheet Sessions API]
**Vulnerability:** `get_my_chats` API fetched all sheet sessions globally without filtering by the authenticated user's ID, exposing private session data to anyone.
**Learning:** List endpoints must enforce authorization checks just like detail endpoints. A lack of `userId` filtering on `find()` queries leads to massive data exposure.
**Prevention:** Always authenticate the request using `getAuthenticatedUser()` and apply `{ userId: user._id }` or similar scope constraints when querying lists of user-owned resources.
