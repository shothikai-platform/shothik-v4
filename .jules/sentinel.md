## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2026-03-17 - Prevent Data Exposure in Sheet Sessions
**Vulnerability:** The `get_my_chats` endpoint for sheet sessions fetched all sessions across all users unconditionally using `SheetSession.find({})`. This is a critical Insecure Direct Object Reference (IDOR) / Broken Access Control vulnerability.
**Learning:** Endpoints that fetch user-specific lists must always incorporate the authenticated user's ID into the query. It's easy to miss authorization checks in simple GET endpoints.
**Prevention:** Always use `getAuthenticatedUser()` and ensure the resulting query enforces a filter like `{ userId: user._id || user.id }` rather than relying on the client not to request or see other users' data.
