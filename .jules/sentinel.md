## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-05-12 - [Secure Geolocation API Route]
**Vulnerability:** Unauthenticated access to Google Geolocation API (potential for abuse/cost) and internal error leakage in response.
**Learning:** Publicly accessible API routes that wrap external paid services must be authenticated to prevent unauthorized usage and quota exhaustion.
**Prevention:** Always use `getAuthenticatedUser()` in API routes and return generic error messages in catch blocks to avoid exposing system internals.
