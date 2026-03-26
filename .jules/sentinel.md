## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2026-03-26 - [Data Leakage in Sheet Chat API]
**Vulnerability:** `get_my_chats` endpoint retrieved all `SheetSession` documents from the database without any user filtering, exposing all users' chat sessions to anyone.
**Learning:** Endpoints returning collections of resources (`find({})`) must be strictly scoped to the authenticated user's ID to prevent cross-user data leakage.
**Prevention:** Never use a wide open `find({})` for user-specific data. Always include `{ userId: user._id || user.id }` in the query filter.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
