## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-24 - [Systemic IDOR Pattern in API Routes]
**Vulnerability:** Multiple API endpoints (Research and Sheet modules) were fetching all resources or allowing direct access by ID without ownership verification.
**Learning:** Middleware in this project protects `/dashboard` but not `/api`, and early development focused on functionality over authorization, leading to a consistent pattern of missing `userId` filters in `find()` and `findById()` calls.
**Prevention:** Every new API route handling user-specific data must explicitly call `getAuthenticatedUser()` and include `userId` in all MongoDB queries.
