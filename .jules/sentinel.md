## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-04-28 - [IDOR in Sheet Session API]
**Vulnerability:** `get_my_chats` and `create_conversation` endpoints for sheets lacked proper authentication and ownership checks (using 'temp-user' and missing `userId` filters).
**Learning:** Forgetting to implement authentication on new modules or using hardcoded placeholder user IDs is a common source of data leaks and IDOR.
**Prevention:** Always use `getAuthenticatedUser()`, avoid hardcoded 'temp-user' strings, and scope all resource lookups with `userId`.
