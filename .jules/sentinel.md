## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-03-22 - Fix IDOR in Sheet API
**Vulnerability:** IDOR (Insecure Direct Object Reference) and Missing Authentication in `/api/sheet/chat/get_my_chats` and `/api/sheet/conversation/create_conversation`.
**Learning:** Endpoints were querying resources without filtering by `userId` or checking authentication status, allowing any user (or unauthenticated clients) to access or modify any session.
**Prevention:** Always verify `getAuthenticatedUser()` and include `{ userId: user._id || user.id }` in database queries for specific resource access.
