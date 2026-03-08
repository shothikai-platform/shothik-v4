## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Unprotected API Routes and Hardcoded User IDs]
**Vulnerability:** IDOR and authentication bypass in Sheet API routes due to hardcoded 'temp-user' ID and missing session ownership checks.
**Learning:** Next.js middleware in this project does not cover the `/api` directory, requiring manual authentication and authorization checks in every route handler. Hardcoded placeholders for user IDs in "temporary" logic often persist into production, creating severe security gaps.
**Prevention:** Implement a standard authentication check using `getAuthenticatedUser()` at the start of every API route and strictly enforce resource ownership via `userId` filtering.
