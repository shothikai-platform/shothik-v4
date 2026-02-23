## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-27 - [Recurring IDOR Pattern & Schema Mismatch]
**Vulnerability:** `update_name` endpoint allowed updating any chat (IDOR) and attempted to update a non-existent `title` field instead of `name`.
**Learning:** Copy-paste errors or outdated assumptions about schema (`title` vs `name`) can compound security vulnerabilities. Multiple endpoints (`update_name`, `delete_chat`) missed the `userId` scoping pattern established in `get_one_chat`.
**Prevention:** Audit all endpoints for `findByIdAndUpdate` usage and replace with `findOneAndUpdate({ _id, userId })`. Verify field names against Mongoose schemas.
