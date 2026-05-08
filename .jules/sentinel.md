## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Insecure Direct Object Reference (IDOR) & Missing Authentication in Research API]
**Vulnerability:** The DELETE and PUT endpoints for research chats, along with the research queue creation endpoint, lacked authentication and ownership verification, allowing unauthorized users to modify or delete any chat session.
**Learning:** New API routes often omit security middleware in Next.js projects unless explicitly enforced, leading to critical authorization gaps.
**Prevention:** Implement a standard "secure handler" pattern that always calls `getAuthenticatedUser()` and includes `userId` in all database queries (e.g., `findOneAndDelete({ _id, userId })`).
