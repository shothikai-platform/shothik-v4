## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-29 - [IDOR in Mongoose Update/Delete Operations]
**Vulnerability:** `delete_chat` and `update_name` endpoints modified resources using `findByIdAndDelete` and `findByIdAndUpdate` without authorization checks, enabling IDOR.
**Learning:** Mongoose convenience methods like `findByIdAndUpdate` inherently lack authorization context and should be avoided in user-facing APIs where resources belong to specific users.
**Prevention:** Replace `findByIdAnd*` methods with `findOneAnd*` methods, explicitly appending the owner's ID to the query conditions (e.g., `{ _id: id, userId: user._id }`).
