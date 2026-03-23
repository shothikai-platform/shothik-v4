## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-26 - [Global Data Leakage in Sheet API]
**Vulnerability:** The `get_my_chats` endpoint in `src/app/api/sheet/chat/get_my_chats/route.ts` returned all `SheetSession` documents globally instead of filtering by the authenticated user's ID.
**Learning:** Endpoints designed to return a specific user's data (like a "my resources" endpoint) must inherently restrict queries using the authentication context, otherwise all users' data is leaked globally.
**Prevention:** Apply `getAuthenticatedUser()` and enforce `userId` filtering on all list endpoints. E.g., `SheetSession.find({ userId: user._id || user.id })`.
