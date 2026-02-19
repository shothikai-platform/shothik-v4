## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-25 - [Missing Auth & IDOR in Research Chat Deletion]
**Vulnerability:** The `delete_chat` endpoint allowed unauthenticated users to delete any chat by ID due to missing `getAuthenticatedUser` check and use of `findByIdAndDelete` instead of scoped query.
**Learning:** The `src/app/api/research` module seems to have a pattern of missing security checks (previously `get_one_chat`, now `delete_chat`, `update_name` likely too). Developers might be copying insecure templates.
**Prevention:** Enforce a strict pattern for all API routes: 1) Always call `getAuthenticatedUser()`. 2) Always use `userId` in database queries (e.g., `findOne({ _id: id, userId: user._id })`).
