## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Unsecured Sheet API & IDOR]
**Vulnerability:** Sheet API endpoints (`get_my_chats` and `create_conversation`) were completely unauthenticated and susceptible to IDOR, allowing any caller to fetch all spreadsheet sessions or attach conversations to sessions they didn't own.
**Learning:** Development-time placeholders (like `userId: 'temp-user'`) and missing auth checks in new modules create significant security gaps if not addressed before they are reachable.
**Prevention:** Always implement `getAuthenticatedUser()` and scope all database operations by `userId` from the initial implementation of any user-facing API route.
