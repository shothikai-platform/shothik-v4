## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-07-06 - [Missing Auth and IDOR in Research Chat Management]
**Vulnerability:** `delete_chat` and `update_name` endpoints lacked authentication and IDOR protection, allowing any user (even unauthenticated ones) to delete or rename any research chat by ID.
**Learning:** Even simple management endpoints must have the same security rigor as creation or retrieval endpoints.
**Prevention:** Implement mandatory authentication checks via `getAuthenticatedUser()` and scope all destructive or modification operations using the authenticated `userId`.
