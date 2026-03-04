## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-04 - [Unauthenticated Data Exposure in Sheet Chat API]
**Vulnerability:** `get_my_chats` endpoint in `src/app/api/sheet/chat/get_my_chats/route.ts` returned all `SheetSession` records across the entire database to any unauthenticated requester.
**Learning:** List endpoints are highly susceptible to mass data leakage if both authentication checks and query scoping (by user ID) are omitted.
**Prevention:** Always use `getAuthenticatedUser()` to enforce a 401 response for unauthenticated access, and strictly scope all `find()` queries to the authenticated user's ID (e.g., `SheetSession.find({ userId: user._id })`).