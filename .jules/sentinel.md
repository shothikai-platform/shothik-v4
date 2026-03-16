## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-03-16 - [Missing Authorization in Sheet Sessions]
**Vulnerability:** The `get_my_chats` API endpoint for Sheet Sessions returned all sessions from the database without verifying the authenticated user or filtering by `userId`.
**Learning:** Endpoints fetching user-specific data must explicitly extract the authenticated user's ID and include it in the database query filter (`{ userId: user._id }`). Relying solely on client-side routing or UI to hide other users' data is a critical Data Exposure/IDOR vulnerability.
**Prevention:** Always use `getAuthenticatedUser()` from `@/lib/server-auth` on sensitive endpoints and ensure all Mongoose queries are scoped to the authenticated user's ID.
