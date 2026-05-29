## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-06-11 - [Information Leakage in Geolocation API]
**Vulnerability:** The Geolocation API was publicly accessible and leaked internal error details by returning `error.message` in 500 responses.
**Learning:** Utility endpoints, even if they don't handle sensitive user data directly, can still leak system information or be abused if not authenticated. Returning raw error messages is a common pattern for information leakage.
**Prevention:** Always require authentication for internal service wrappers and return generic error messages to the client.
