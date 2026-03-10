## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-03-10 - Unauthenticated Sheet Sessions
**Vulnerability:** The `get_my_chats` and `create_conversation` endpoints in `src/app/api/sheet/` lacked authentication (`getAuthenticatedUser()`) and returned global results or used hardcoded `userId`s ("temp-user"). They also lacked user-scoping in read queries (IDOR).
**Learning:** These endpoints were previously accessible without auth and blindly queried `SheetSession.find({})` and `SheetSession.findById(chatId)`, resulting in data exposure and potential manipulation of other users' sessions.
**Prevention:** Always enforce `getAuthenticatedUser()` checks on API routes and ensure `Mongoose` queries scope by the current user's ID `({ userId: user._id || user.id })` for read/write operations to prevent IDOR and data leakage.
