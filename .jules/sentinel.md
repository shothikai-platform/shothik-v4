## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-03-09 - IDOR Data Leakage in SheetSession get_my_chats
**Vulnerability:** The SheetSession `get_my_chats` endpoint lacked authentication and was returning all sheet sessions in the database, indiscriminately exposing user data (IDOR data leakage).
**Learning:** Endpoints returning user data must check for authentication using `getAuthenticatedUser()` and specifically scope queries like `find()` to `user._id` or `user.id`. Without scoping, unauthorized users can fetch globally sensitive records.
**Prevention:** Always verify authentication before fetching user data and scope queries to the authenticated user ID. Add `lean()` for read-only optimization to restrict exposure.
