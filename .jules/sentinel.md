## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-03-12 - Missing Authentication on SheetSession GET endpoint
**Vulnerability:** The `src/app/api/sheet/chat/get_my_chats/route.ts` endpoint lacked authentication and returned all `SheetSession` records (`find({})`), exposing them to any unauthenticated user. This is a critical unauthenticated data exposure.
**Learning:** Newly created API routes (especially for new features like `SheetSession`) are frequently missing the basic `getAuthenticatedUser()` checks and proper query scoping.
**Prevention:** Always verify that newly added feature endpoints include `getAuthenticatedUser()` and scope all data queries (e.g., `find`, `findOne`) with `{ userId: user._id || user.id }` to prevent unauthenticated access and IDOR.
