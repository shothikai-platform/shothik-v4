## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-05-24 - IDOR Vulnerability in SheetSession Chat Fetching
**Vulnerability:** The `get_my_chats` endpoint for `SheetSession` returned all user sessions in the database without any authorization filtering.
**Learning:** The database query used `SheetSession.find({})` which ignored the concept of document ownership, allowing any user (even unauthenticated) to read all chats.
**Prevention:** Always verify caller authentication using `getAuthenticatedUser()` and enforce ownership by passing `userId: user._id || user.id` as a filter in database queries like `.find()` or `.findOne()`.
