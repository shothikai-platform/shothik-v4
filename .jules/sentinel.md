## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-26 - [IDOR & Missing Authentication in Chat Rename API]
**Vulnerability:** The `update_name` API endpoint was entirely unauthenticated and vulnerable to IDOR, enabling any client to rename any user's research chat via direct document ID manipulation.
**Learning:** Security controls can be easily missed on auxiliary/helper endpoints (like renaming or metadata updates) even when core CRUD endpoints are secured.
**Prevention:** Always enforce standard authentication via `getAuthenticatedUser()` and authorize resource updates via user-scoped Mongoose queries (e.g., `findOneAndUpdate({ _id: id, userId })`) on every write endpoint.
