## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-05-24 - [IDOR in SheetSession get_my_chats]
**Vulnerability:** The `/api/sheet/chat/get_my_chats` endpoint lacked authentication and returned all users' sessions without filtering by user ID, leading to a critical Insecure Direct Object Reference (IDOR) data leak.
**Learning:** Endpoints meant to fetch "my" resources often accidentally query the entire collection if `getAuthenticatedUser()` checks and `userId` filters are forgotten during rapid development.
**Prevention:** Always ensure "get my [resource]" endpoints include both an authentication check and a strict `{ userId: user._id || user.id }` query filter before executing `Model.find()`.
