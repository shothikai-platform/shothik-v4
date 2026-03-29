## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Unsecured Open Proxy in Webhook Endpoint]
**Vulnerability:** The `zoho-webhook` endpoint blindly forwarded POST requests to an external URL without authentication, acting as an open proxy for potential spam/abuse.
**Learning:** Endpoints intended for server-to-server communication (webhooks) or client-proxies must still be secured to prevent unauthorized triggering, especially if they perform side effects (like calling external APIs).
**Prevention:** Always authenticate the user (via `getAuthenticatedUser`) before processing any request that triggers external API calls or side effects.
