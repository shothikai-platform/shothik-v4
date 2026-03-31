## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2026-03-31 - [IDOR in Research Chat Endpoints]
**Vulnerability:** `delete_chat` and `update_name` endpoints performed database updates using `findByIdAndDelete` and `findByIdAndUpdate` without verifying user ownership.
**Learning:** Relying purely on checking if an authenticated user exists is insufficient for access control. Database modification requests involving IDs must specifically scope their lookups to verify the requester owns the modified resource.
**Prevention:** Replace direct ID queries (`findByIdAndUpdate`, `findByIdAndDelete`) with specific queries like `findOneAndUpdate({ _id: id, userId: currentUser._id })` to enforce authorization implicitly at the database query layer.
