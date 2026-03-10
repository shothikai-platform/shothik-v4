## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## $(date +%Y-%m-%d) - Authorization Bypass in SheetSession get_my_chats
**Vulnerability:** The `GET /api/sheet/chat/get_my_chats` endpoint lacked authentication and authorization checks, returning all users' sheet sessions to any unauthenticated requester (IDOR vulnerability).
**Learning:** Endpoints retrieving user-specific data must always explicitly verify authentication and filter database queries by the authenticated user's ID.
**Prevention:** Always use `getAuthenticatedUser()` at the start of personal data endpoints and strictly scope MongoDB queries (e.g., `SheetSession.find({ userId: user._id })`). Use `.lean()` for read-only queries.
