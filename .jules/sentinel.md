## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-15 - [IDOR in Research Chat APIs (Delete, Update, Queue)]
**Vulnerability:** Several Research Chat endpoints (`delete_chat`, `update_name`, `create_research_queue`) were vulnerable to IDOR by using `findById` without ownership checks.
**Learning:** Repetitive IDOR patterns indicate a need for a "secure-by-default" approach when accessing user-owned resources. Deletion and long-running research tasks are high-impact operations.
**Prevention:** For every resource-specific API route, enforce authentication via `getAuthenticatedUser()` and authorize via `findOne({ _id: id, userId: user._id })` or similar scoped queries.
