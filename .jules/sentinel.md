## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-26 - [IDOR in Research API Delete and Queue Endpoints]
**Vulnerability:** `delete_chat` and `create_research_queue` endpoints allowed actions on research chats without verifying user ownership.
**Learning:** Every endpoint that modifies or interacts with a user-owned resource must verify ownership, even if it's a sub-action like adding to a queue.
**Prevention:** Scoped ownership checks (e.g., `findOneAndDelete({ _id: id, userId: user._id })`) should be applied consistently across all CRUD and action-based endpoints.
