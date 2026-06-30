## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2025-02-27 - [Authorization Bypass in Sheet Chat API]
**Vulnerability:** `get_my_chats` endpoint fetched all sheet sessions globally without verifying the authenticated user or filtering by `userId`, exposing private session data to anyone.
**Learning:** Similar to the Research Chat API IDOR, list endpoints without proper `userId` filtering can easily expose all data across the platform, acting as a complete data leakage vulnerability rather than just IDOR.
**Prevention:** For any user-specific listing endpoints (e.g., `get_my_chats`), always enforce authentication first and restrict database queries with `{ userId: currentUser._id }` or `{ userId: currentUser.id }` to guarantee data isolation.
