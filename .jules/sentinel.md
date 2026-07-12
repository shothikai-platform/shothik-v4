## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-24 - [Reversion of IDOR Protection in Sheet API]
**Vulnerability:** Broken Access Control (IDOR) in `get_my_chats` endpoint where authentication and user-scoping were missing, exposing all chat sessions.
**Learning:** Security fixes in this codebase appear prone to being reverted or overwritten, possibly due to concurrent development or lack of persistent tests.
**Prevention:** Always include automated tests for security fixes and verify the current state of the code regardless of what documentation or memory suggests.
