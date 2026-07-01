## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-07-01 - [Auth Bypass and IDOR in Research Chat API]
**Vulnerability:** Several Research Chat API endpoints (DELETE, PUT) lacked both authentication and authorization, allowing any user (or unauthenticated request) to delete or rename any research chat by ID.
**Learning:** Legacy endpoints or quickly implemented features often miss standard security middleware or owner checks, especially when they use generic `findById` patterns.
**Prevention:** Always verify authentication via `getAuthenticatedUser()` and enforce ownership using `findOneAndDelete({ _id: id, userId: user._id })` or similar scoped queries.
