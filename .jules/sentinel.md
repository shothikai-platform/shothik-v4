## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2026-04-12 - [IDOR in Research Chat Modification APIs]
**Vulnerability:** `update_name` and `delete_chat` endpoints blindly modified or deleted resources by `id` without verifying user ownership, leading to Insecure Direct Object Reference (IDOR) vulnerabilities.
**Learning:** Database update/delete operations (e.g., `findByIdAndUpdate`, `findByIdAndDelete`) are inherently dangerous when only provided an ID from client input.
**Prevention:** Always pair the resource ID with the authenticated user's ID using scoped queries like `findOneAndUpdate({ _id: id, userId: currentUser._id })` instead of `findByIdAndUpdate(id)`.
