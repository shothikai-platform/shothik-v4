## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-03-07 - [IDOR in update_name API endpoint via findByIdAndUpdate]
**Vulnerability:** The `update_name` API endpoint allowed unauthenticated users and authenticated users to modify any chat by simply knowing its ID. The endpoint updated the schema property `name` with a wrong property `title`.
**Learning:** The endpoint used `ResearchChat.findByIdAndUpdate(id)` which doesn't check the `userId` field to restrict the scope. Furthermore, it didn't call `getAuthenticatedUser()` leading to complete unauthenticated access. Mismatching schema properties (`name` vs `title`) was also observed.
**Prevention:** Always verify authentication context (`getAuthenticatedUser()`) for endpoints updating or deleting data. Ensure DB modifications are scoped correctly to the current user (e.g., `findOneAndUpdate({ _id: id, userId: user._id || user.id })`).
