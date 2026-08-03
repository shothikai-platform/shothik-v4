## 2025-06-03 - [Unauthenticated & Unscoped Sheets API Endpoints]
**Vulnerability:** The spreadsheet endpoints (`/api/sheet/chat/get_my_chats` and `/api/sheet/conversation/create_conversation`) were unauthenticated and completely lacked ownership checks, allowing any user to read/modify any other user's sheets session.
**Learning:** Legacy or copy-pasted endpoints often retain mock/temporary behavior (like `'temp-user'`) and bypass security policies if not explicitly reviewed during feature integration.
**Prevention:** Every API gateway route must require token-based authentication via `getAuthenticatedUser()` and enforce strict ownership of data model records by querying via the authenticated user ID.

## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
