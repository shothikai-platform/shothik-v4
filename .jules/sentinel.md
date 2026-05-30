## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat`, `update_name`, and `delete_chat` endpoints fetched/modified chats by ID without verifying user ownership, allowing unauthorized access to or deletion of other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources. Many legacy routes in this codebase use `findById...` which lacks built-in ownership scoping.
**Prevention:** Always scope database queries with `userId` (e.g., `findOneAndUpdate({ _id: id, userId: currentUser._id }, ... )`) instead of just `findByIdAndUpdate(id, ...)`.
