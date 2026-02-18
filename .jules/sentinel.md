## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-22 - [Pattern of Unprotected API Routes in Research Module]
**Vulnerability:** Multiple endpoints in `src/app/api/research/chat` (`delete_chat`, `get_one_chat`, `update_name`) lacked authentication and authorization checks.
**Learning:** Developers likely copy-pasted the insecure pattern or assumed internal use. The `ResearchChat` model has `userId` but it wasn't being used for ownership checks.
**Prevention:** Enforce a "secure by default" middleware or wrapper for all `/api/research` routes, or add a lint rule to require `getAuthenticatedUser` in all route handlers.
