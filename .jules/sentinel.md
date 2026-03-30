## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-30 - [IDOR in Research Chat Deletion and Update API]
**Vulnerability:** `delete_chat` and `update_name` endpoints allowed modification and deletion of arbitrary chats using only their ID (`findByIdAndDelete` and `findByIdAndUpdate`).
**Learning:** Authorization and ownership checks are equally required for modification operations as they are for read operations. Lack of these can lead to unauthorized data tampering or loss.
**Prevention:** Always scope write and delete operations with the user's ID using `findOneAndUpdate` or `findOneAndDelete` with `{ _id: id, userId: user._id }` instead of direct ID manipulation.
