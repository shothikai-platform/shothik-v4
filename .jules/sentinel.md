## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-03 - Unauthenticated Global Document Queries
**Vulnerability:** IDOR (Insecure Direct Object Reference) and Missing Authentication on the `/api/sheet/chat/get_my_chats` endpoint, leading to global exposure of all users' `SheetSession` records.
**Learning:** This codebase tends to have read-only endpoints directly querying MongoDB using `.find({})` without strictly verifying `getAuthenticatedUser()` or scoping to `{ userId: user._id }`. This pattern skips critical authorization layers.
**Prevention:** Always verify `getAuthenticatedUser()` and strictly scope all database queries (e.g. `SheetSession.find({ userId: user._id })`) using the authenticated user's ID to prevent unauthorized data access.
