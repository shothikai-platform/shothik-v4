## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-24 - [Hardcoded User ID in Production Routes]
**Vulnerability:** `create_conversation` route used a hardcoded `'temp-user'` string as the `userId` for new sessions, bypassing proper user attribution and potentially allowing cross-user data leakage if the 'temp-user' ID was predictable or shared.
**Learning:** Development placeholders like "temp-user" can easily leak into production if not strictly managed or if the authentication flow is not integrated from the start.
**Prevention:** Avoid using placeholder strings for user IDs; ensure every route that persists user-owned data requires authentication and uses the verified user ID from the session/token.
