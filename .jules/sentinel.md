## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-24 - [IDOR in Chat Update and Delete Endpoints]
**Vulnerability:** `update_name` and `delete_chat` endpoints modified or deleted research chats by ID without verifying user ownership, allowing any authenticated user to tamper with another's data.
**Learning:** Destructive operations (update, delete) are just as vulnerable to IDOR as read operations, and must explicitly check ownership.
**Prevention:** Replace `findByIdAndUpdate` and `findByIdAndDelete` with `findOneAndUpdate` and `findOneAndDelete`, scoping the query to both `_id` and the authenticated `userId`.
