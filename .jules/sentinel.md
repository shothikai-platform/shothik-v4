## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-07-01 - Missing Authorization Filter in get_my_chats Endpoint
**Vulnerability:** IDOR (Insecure Direct Object Reference) in `src/app/api/sheet/chat/get_my_chats/route.ts`. The endpoint queried all `SheetSession` records globally without filtering by the authenticated user's ID, exposing potentially sensitive user data to anyone.
**Learning:** Even if an endpoint implies personal data by name ("get_my_chats"), the underlying Mongoose query must explicitly enforce authorization boundaries by filtering via `userId`.
**Prevention:** Always extract the authenticated user (`getAuthenticatedUser()`) and explicitly filter MongoDB/Mongoose queries using `{ userId: user._id || user.id }` in all endpoints returning user-specific data.
