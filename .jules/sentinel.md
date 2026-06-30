## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-22 - [IDOR and Missing Auth in Research API]
**Vulnerability:** `update_name`, `delete_chat`, and `create_research_queue` endpoints lacked authentication and IDOR protection, allowing any user to modify or delete any research chat.
**Learning:** Legacy endpoints or rapidly prototyped features often skip standard security middleware or owner checks.
**Prevention:** Enforce a "Secure by Default" policy where all new API routes must explicitly check for an authenticated user and scope all database operations to that user's ID.
