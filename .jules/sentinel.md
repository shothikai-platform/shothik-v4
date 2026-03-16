## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2026-03-16 - [Missing Authentication and IDOR in Sheet Chat]
**Vulnerability:** The `create_conversation` endpoint for sheets lacked authentication (hardcoded `userId: 'temp-user'`) and had an IDOR vulnerability where any user could inject conversations into any `chatId` because the lookup didn't verify ownership (`SheetSession.findById(chatId)`).
**Learning:** Even simple endpoints like "create conversation" require authentication and ownership verification, particularly when interacting with database entities that store sensitive user interactions.
**Prevention:** Always wrap API endpoints with `getAuthenticatedUser()` and use `findOne({ _id: resourceId, userId: user._id })` instead of `findById` to ensure the current user owns the resource they are trying to modify.
