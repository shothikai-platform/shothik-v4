## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR in Sheet Sessions API]
**Vulnerability:** `get_my_chats` for Sheet module fetched ALL sessions from the database without authentication or user-specific filtering, exposing all users' spreadsheet metadata.
**Learning:** Legacy or "utility" endpoints often get overlooked during security audits; a missing `getAuthenticatedUser()` call can expose the entire collection.
**Prevention:** Standardize all API routes to use a common authentication wrapper or ensure `getAuthenticatedUser()` is called and its result is used to filter database queries.
