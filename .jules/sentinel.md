## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-03-16 - [IDOR and Hardcoded User in Sheet API]
**Vulnerability:** Sheet API endpoints lacked authentication and authorization, used a hardcoded 'temp-user', and allowed unauthorized access to any session via ID.
**Learning:** Legacy or experimental features (like 'Sheet' mock functionality) often bypass security middleware and standard auth patterns, requiring manual implementation of ownership checks in each route.
**Prevention:** Audit all API routes for consistent use of `getAuthenticatedUser()` and ensure Mongoose queries for user-owned resources always include `userId`.
