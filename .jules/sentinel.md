## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-22 - [IDOR & Auth Bypass in Sheet API]
**Vulnerability:** `get_my_chats` and `create_conversation` endpoints in the Sheet API completely lacked authentication checks, and `create_conversation` hardcoded `userId` to 'temp-user', resulting in IDOR and unauthorized session creation/modification.
**Learning:** Newly introduced feature APIs (like the Sheet integration) often overlook global authentication requirements if middleware isn't strictly enforced on the path.
**Prevention:** Always mandate `getAuthenticatedUser()` checks on all API routes that access user data or create database records, and enforce ownership checks using `findOne({ _id: id, userId })` instead of `findById(id)`.
