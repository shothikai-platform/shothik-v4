## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2025-03-05 - Missing Auth Check Exposes All SheetSessions
**Vulnerability:** The `get_my_chats` endpoint for SheetSessions lacked authentication and authorization, returning `SheetSession.find({})`. This is a critical Broken Access Control / IDOR vulnerability exposing all users' sheet sessions to unauthenticated visitors.
**Learning:** In Next.js App Router API handlers, missing or implicitly trusted auth logic allows endpoints to leak global data by default.
**Prevention:** Always verify `getAuthenticatedUser()` at the beginning of sensitive routes and scope database read operations to `{ userId: user._id || user.id }`.
