## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Middleware Limitations and Explicit API Protection]
**Vulnerability:** Missing authentication and IDOR in Sheet API routes (`get_my_chats`, `create_conversation`).
**Learning:** `middleware.ts` in Next.js projects often only protects page routes (UI). API routes require explicit authentication (`getAuthenticatedUser`) and authorization (ownership checks) within each handler. Hardcoded user IDs (e.g., `'temp-user'`) should be eliminated during security hardening.
**Prevention:** Implement a standard "check-auth-then-verify-ownership" pattern at the start of every API route handler that accesses user-specific data.
