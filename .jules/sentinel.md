## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-27 - [IDOR in Research Chat Name Update and Delete API]
**Vulnerability:** `update_name` and `delete_chat` endpoints in the Research Chat API performed operations via `findByIdAndUpdate` and `findByIdAndDelete` using only the chat ID, allowing unauthorized users to modify or delete other users' chats.
**Learning:** Similar to the previous IDOR finding in `get_one_chat`, modification endpoints are also susceptible to IDOR if they do not explicitly scope the query to the authenticated user's ID. Mongoose's `findById...` methods inherently lack authorization checks.
**Prevention:** Avoid `findByIdAndUpdate` and `findByIdAndDelete` in user-facing APIs. Always use `findOneAndUpdate` and `findOneAndDelete` with queries scoped by `userId` (e.g., `{ _id: id, userId: currentUser._id }`) to enforce ownership.
