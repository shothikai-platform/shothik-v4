## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-02-11 - [IDOR in Research API Endpoints]
**Vulnerability:** Multiple endpoints in the research API (delete_chat, update_name, create_research_queue) lacked authentication and ownership checks.
**Learning:** Even when some endpoints in a module are secured, others might be overlooked, especially during rapid development of new features (like delete or update functionality).
**Prevention:** Always use a middleware or a standardized wrapper for all API routes that access user data to ensure 'getAuthenticatedUser' is called and 'userId' is included in all database filters.
