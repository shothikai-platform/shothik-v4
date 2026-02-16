## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR in Research Chat Delete and Update]
**Vulnerability:** Insecure Direct Object Reference (IDOR) in `delete_chat` and `update_name` endpoints.
**Learning:** Even when authentication is implemented in some parts of a module, other endpoints might be overlooked, especially those performing destructive or modification operations.
**Prevention:** Use a consistent authorization pattern across all endpoints in a module. Always include the owner's ID (e.g., `userId`) in the query filter for any operation on user-specific resources.
