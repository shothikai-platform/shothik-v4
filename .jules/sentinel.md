## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-03-22 - Fix hardcoded user and IDOR in conversation creation
**Vulnerability:** Hardcoded `userId: "temp-user"` and missing resource ownership check (`findById`) in `src/app/api/sheet/conversation/create_conversation/route.ts` allowed unauthenticated access and Insecure Direct Object Reference (IDOR).
**Learning:** Endpoints that create or access resources related to a user often lack authentication logic, relying on hardcoded IDs or insecure `findById` queries that don't restrict based on `userId`.
**Prevention:** Always authenticate users on API endpoints via `getAuthenticatedUser()`, set `userId` correctly in new resources, and use `findOne({ _id: resourceId, userId: user._id || user.id })` to ensure ownership before accessing existing resources.
