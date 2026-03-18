## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-05-20 - Unauthenticated IDOR in get_my_chats
**Vulnerability:** The `src/app/api/sheet/chat/get_my_chats/route.ts` endpoint was fetching all `SheetSession` records from the database without any authentication or authorization checks. Any user could view all other users' chat sessions.
**Learning:** Even endpoints clearly named "my" (implying user-specific data) can be vulnerable to IDOR if the `find()` query does not explicitly filter by the authenticated user's ID.
**Prevention:** Always use `getAuthenticatedUser()` to verify the request. When querying for user-specific data, always include `{ userId: user._id || user.id }` in the Mongoose `find()` or `findOne()` queries to ensure users can only access their own resources.
