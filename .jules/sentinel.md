## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-22 - [IDOR in Research Chat Delete API]
**Vulnerability:** `delete_chat` endpoint deleted chats by ID without verifying user ownership, allowing unauthorized deletion of other users' chats.
**Learning:** IDOR vulnerabilities exist across all CRUD operations (Create, Read, Update, Delete) when direct object references are used without authorization checks. The read operations (`get_one_chat`) and update operations were previously fixed, but delete operations were missed.
**Prevention:** Consistently apply authorization scopes (`userId: user._id`) across *all* database queries (Read, Update, Delete) that interact with user-specific resources, and verify `getAuthenticatedUser()` in every sensitive endpoint.
