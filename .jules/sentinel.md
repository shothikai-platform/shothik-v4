## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-29 - [IDOR in Research Chat Write Endpoints]
**Vulnerability:** `delete_chat` and `update_name` endpoints modified chats based solely on chat ID via `findByIdAndDelete` and `findByIdAndUpdate`, allowing an attacker to modify or delete other users' chats.
**Learning:** Write endpoints (PUT/DELETE) are just as susceptible to IDOR as read endpoints, and Mongoose functions like `findByIdAndUpdate` bypass ownership checks inherently.
**Prevention:** Always use scoped queries like `findOneAndDelete` or `findOneAndUpdate` with the authenticated `userId` appended to the filter instead of `findById` variants.
