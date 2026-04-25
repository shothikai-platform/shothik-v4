## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-24 - [IDOR and Missing Auth in Sheet API]
**Vulnerability:** Sheet API endpoints (`get_my_chats` and `create_conversation`) were entirely unauthenticated and lacked ownership checks, allowing any user to view or modify any spreadsheet session.
**Learning:** New modules or features (like the Sheet module) may accidentally bypass the global middleware if it's not configured to cover `/api`, requiring manual auth checks in every route handler.
**Prevention:** Standardize a security boilerplate for all new API routes that includes `getAuthenticatedUser()` and `userId` scoping for all database operations.
