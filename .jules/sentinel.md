## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-04-17 - [IDOR and Missing Auth in Sheet API]
**Vulnerability:** `get_my_chats` in Sheet module returned all sessions from the database without authentication or ownership checks.
**Learning:** New modules often copy-paste insecure boilerplate or forget to implement the standard auth/authorization pattern used in older modules.
**Prevention:** Audit all `find({})` calls in API routes to ensure they are properly scoped to the authenticated user.
