## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-07-04 - [Residual Development Credentials and Public APIs]
**Vulnerability:** The 'Sheet' API module used hardcoded 'temp-user' IDs and lacked authentication, exposing user data and allowing unauthorized session creation.
**Learning:** Code intended for rapid prototyping or simulation can easily leak into production with insecure defaults (like public endpoints and hardcoded IDs).
**Prevention:** Use standardized authentication wrappers or decorators for all new API routes and never use hardcoded "temp" user IDs in database models.
