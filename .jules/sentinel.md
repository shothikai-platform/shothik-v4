## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-03-20 - [IDOR in Sheet Chat API]
**Vulnerability:** `get_my_chats` endpoint fetched all chats for all users across the system without filtering by user ownership.
**Learning:** Endpoints meant to fetch "my" data must explicitly query with the authenticated user's ID. Returning all documents unconditionally in a multi-tenant application leads to critical data exposure.
**Prevention:** Always authenticate the user and scope database queries with `userId` (e.g., `find({ userId: currentUser._id })`) instead of `find({})`.
