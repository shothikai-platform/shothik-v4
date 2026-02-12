## 2025-06-12 - [Unrestricted WebSocket CORS]
**Vulnerability:** The NLP inference service's WebSocket endpoint allowed connections from any origin (`*`), enabling potential Cross-Site WebSocket Hijacking (CSWSH).
**Learning:** Defaulting to `*` for CORS is convenient for development but catastrophic for production security, especially for stateful or authenticated WebSocket connections.
**Prevention:** Align WebSocket CORS policy with the REST API policy by enforcing `ALLOWED_ORIGINS` from environment variables, defaulting to a deny-all state if undefined.

## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
