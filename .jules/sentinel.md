## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-22 - [Critical Information Exposure in Sheet Chat API]
**Vulnerability:** `get_my_chats` endpoint for SheetSession lacked authentication and returned all `SheetSession` documents via `find({})`, exposing data for all users.
**Learning:** Endpoints meant to return user-specific data must explicitly check for authentication and enforce ownership at the database query level, rather than relying on default queries.
**Prevention:** Always scope queries intended to retrieve "my" resources with the authenticated user's ID (e.g., `find({ userId: user._id })`) and verify authentication early in the request lifecycle.
