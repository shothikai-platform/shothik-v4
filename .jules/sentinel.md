## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Authentication and IDOR in Sheet API]
**Vulnerability:** Sheet API endpoints (`get_my_chats` and `create_conversation`) were completely unauthenticated and lacked ownership checks, allowing any user (or unauthenticated attacker) to list all sessions and modify existing ones via IDOR.
**Learning:** New modules (like 'Sheet') might be implemented with "temp-user" placeholders or missing auth middleware during early development, and these can easily be forgotten and leaked into production.
**Prevention:** Establish a "Secure by Default" checklist for all new API routes that requires `getAuthenticatedUser()` and `userId` scoping for all database operations before any route is considered "complete".
