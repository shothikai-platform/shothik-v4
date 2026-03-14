## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2025-02-17 - [IDOR in SheetSession get_my_chats]
**Vulnerability:** The `/api/sheet/chat/get_my_chats` endpoint lacked authentication and authorization checks, returning all database sessions (`SheetSession.find({})`) to any unauthenticated user.
**Learning:** Endpoints returning sensitive user lists must explicitly verify the user token via `getAuthenticatedUser()` and scope the database query with `{ userId: user._id || user.id }`.
**Prevention:** Always authenticate sensitive `GET` API endpoints and use authorization queries scoped by the user's ID to prevent Insecure Direct Object Reference (IDOR) and data exposure.
