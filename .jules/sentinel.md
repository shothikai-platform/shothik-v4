## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR in Sheet API routes]
**Vulnerability:** Sheet session listing and conversation creation endpoints were missing authentication and authorization checks, allowing any user to access all sessions and create sessions for others.
**Learning:** Forgetting to apply authentication middleware/helpers in new feature routes leads to immediate security gaps.
**Prevention:** Always verify `getAuthenticatedUser()` returns a valid user and use their ID to filter all database operations (e.g., `findOne({ _id: id, userId: user._id })`).
