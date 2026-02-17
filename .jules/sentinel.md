## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-17 - [Auth and IDOR in Sheet and Geolocation APIs]
**Vulnerability:** IDOR in Sheet API allowed unauthorized access to sessions; missing auth in Geolocation API allowed public access to server-side Google API keys.
**Learning:** Legacy "temp-user" patterns and omitted auth checks in utility APIs (like geolocation) create easy targets for data leaks and resource abuse.
**Prevention:** Standardize `getAuthenticatedUser` usage across all API routes and ensure all session-based lookups are explicitly tied to the authenticated user's ID.
