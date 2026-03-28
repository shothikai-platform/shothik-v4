## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-26 - [Critical IDOR in Sheet Chat List Endpoint]
**Vulnerability:** The `get_my_chats` endpoint for Sheet Chat fetched ALL sessions globally (`SheetSession.find({})`) without any user filtering, exposing sensitive data of all users.
**Learning:** Even simple list endpoints can be catastrophic if they omit user scoping. The assumption that `find({})` is safe for "my chats" is a dangerous fallacy.
**Prevention:** Mandate that all `find()` operations in user-facing APIs MUST include a `{ userId: ... }` clause. Implement lint rules or pre-commit hooks to flag bare `find({})` calls in API routes.
