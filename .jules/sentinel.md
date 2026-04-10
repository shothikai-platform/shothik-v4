## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-04-10 - [Missing Auth and IDOR in Sheet and Research APIs]
**Vulnerability:** Endpoints `create_conversation`, `get_my_chats`, and `create_research_queue` were entirely missing authentication checks, leaving them open to unauthenticated use. Some endpoints were assigning mock users (`temp-user`), and existing resources were accessible via ID without verifying ownership.
**Learning:** API routes must explicitly verify both authentication and authorization independently. Hardcoding temporary IDs masks the lack of proper auth flows and makes IDOR inevitable.
**Prevention:** Integrate a mandatory standard `getAuthenticatedUser()` check at the beginning of sensitive API routes and ensure all database lookups enforce user ownership via `userId` comparison.
