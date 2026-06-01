## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-06-12 - [Information Leakage in Error Responses]
**Vulnerability:** API routes (e.g., `geolocation`) were returning raw `error.message` in 500 responses, potentially leaking sensitive system information or stack traces.
**Learning:** Exposing detailed error messages to the client is a security risk as it provides attackers with insights into the application's internal workings.
**Prevention:** Catch all errors in API handlers and return generic messages like "Internal Server Error" while logging the detailed error server-side.
