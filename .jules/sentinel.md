## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Authentication Bypass & IDOR in Chat Name Update API]
**Vulnerability:** The research chat `update_name` API endpoint was completely unauthenticated and updated documents using only `findByIdAndUpdate` without verifying ownership, allowing any anonymous user to modify any user's research chat names (and potentially cause DoS via massive name input payloads).
**Learning:** Endpoints that mutate state (PUT/POST/DELETE) are prime targets for unauthorized modifications and must always have authentication checks combined with ownership-scoped authorization checks.
**Prevention:** Always use `getAuthenticatedUser()` to check authentication, validate payload schema/lengths, and perform mutations using ownership-scoped queries (like `findOneAndUpdate({ _id: id, userId: user._id })`).
