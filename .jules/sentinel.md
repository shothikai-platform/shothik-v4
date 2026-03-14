## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-05-24 - Missing Authentication and IDOR in Sheet Session Chats
**Vulnerability:** The GET `/api/sheet/chat/get_my_chats/route.ts` endpoint was returning all `SheetSession` records globally without verifying user authentication or restricting the query to the authenticated user's ID.
**Learning:** Endpoints meant to return user-specific data must explicitly include an authentication check and tie database queries to the authenticated user's ID. Relying on client-side routing or context to obscure data isn't secure.
**Prevention:** Always use `getAuthenticatedUser()` in protected routes and ensure database queries filter by `{ userId: user._id || user.id }` rather than fetching globally.
