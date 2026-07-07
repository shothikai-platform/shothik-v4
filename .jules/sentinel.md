## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-22 - [Defense in Depth for Async Streams]
**Vulnerability:** `create_research_queue` lacked authentication and IDOR protection, allowing anyone to trigger research tasks on any chat ID.
**Learning:** Even if an endpoint simulates background work or uses streaming, every database interaction must be authorized against the current session.
**Prevention:** Carry the authenticated user's ID into async closures or stream controllers to ensure subsequent DB operations (like `findOneAndUpdate`) remain scoped to that user.
