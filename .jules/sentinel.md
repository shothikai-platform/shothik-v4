## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-03-26 - [IDOR and Auth Bypass in Research Chat APIs]
**Vulnerability:** Mutating endpoints (`update_name`, `delete_chat`, `create_research_queue`) allowed unauthenticated requests and IDOR by failing to verify the current user and their ownership of the `ResearchChat` document.
**Learning:** Mutating endpoints are just as vulnerable to IDOR as read endpoints, and failing to verify authentication means anyone could potentially overwrite or delete data. Even background/streaming operations need to assert ownership.
**Prevention:** Enforce `getAuthenticatedUser()` checks and strictly use `findOneAndUpdate` or `findOneAndDelete` with `{ _id: id, userId: currentUser._id }` for mutating endpoints instead of `findByIdAndUpdate`/`findByIdAndDelete`.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
