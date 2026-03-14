## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-14 - [IDOR in Research Chat Delete API]
**Vulnerability:** `delete_chat` endpoint used `findByIdAndDelete(id)` without checking if the user actually owns the chat, allowing unauthorized users to delete any chat if they know or guess the ID.
**Learning:** Checking authentication is not enough; authorization (ownership check) must be strictly enforced on state-mutating endpoints just like on read endpoints.
**Prevention:** Always scope database mutations (like delete and update) with `userId` (e.g., `findOneAndDelete({ _id: id, userId: currentUser._id })`) instead of using `findByIdAndDelete(id)`.
