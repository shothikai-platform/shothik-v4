## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Data Leak in Sheet Chat API]
**Vulnerability:** `get_my_chats` endpoint for Sheet sessions was completely unauthenticated and returned ALL sessions in the database (`SheetSession.find({})`) to anyone.
**Learning:** Endpoints copied from other features (like Research Chat) might miss critical security checks. "get_my_chats" implies user-scoped data, but the implementation was global.
**Prevention:** Default to "deny all" and strictly scope every database query to `userId` unless explicitly intended to be public. Use unit tests to verify 401 response for unauthenticated requests.
