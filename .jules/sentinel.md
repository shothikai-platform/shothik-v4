## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Insecure Direct Object Reference in Sheet Chat API]
**Vulnerability:** Unauthenticated data exposure. The `get_my_chats` endpoint in the sheet tool was fetching all `SheetSession` records across the entire database without checking authentication or filtering by user ID.
**Learning:** Missing authentication and authorization filters in read endpoints can lead to severe data leaks, exposing all users' conversational metadata to anonymous requesters.
**Prevention:** Always ensure `getAuthenticatedUser()` is called to block unauthenticated requests, and strictly filter database queries (e.g., `SheetSession.find({ userId: user._id })`) to restrict access to resources owned by the requester.
