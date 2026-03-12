## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-05-18 - Unauthenticated Data Exposure & IDOR in get_my_chats
**Vulnerability:** The `get_my_chats` endpoint for `SheetSession` returned all chat sessions (`SheetSession.find({})`) globally without any user authentication or filtering by user ID.
**Learning:** This exposes all users' chats and data globally without authorization. State-reading and state-mutating endpoints must enforce ownership validation using the authenticated user.
**Prevention:** Always extract `user` from `getAuthenticatedUser()`, return `401` if missing, and apply `userId: user._id || user.id` as a filter condition in MongoDB read and update queries.
