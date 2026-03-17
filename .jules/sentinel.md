## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2026-03-17 - [Missing Authentication on Proxy Endpoint]
**Vulnerability:** The `/api/geolocation` endpoint was accessible without any authentication, acting as an open proxy to the Google Geolocation and Geocoding APIs.
**Learning:** Proxy endpoints that wrap third-party paid APIs must have their own authorization checks to prevent unauthenticated abuse and quota exhaustion.
**Prevention:** Always use `getAuthenticatedUser()` at the beginning of API route handlers that act as proxies or perform actions with side effects.
