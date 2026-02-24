## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Recurring IDOR Pattern in API Routes]
**Vulnerability:** Insecure Direct Object Reference (IDOR) in multiple Research API endpoints allowing unauthorized access/modification of other users' data.
**Learning:** The application lacks a centralized authorization middleware for the `/api` directory, leading to developers frequently forgetting to implement manual ownership checks in new route handlers.
**Prevention:** Every API route handling user-specific data must explicitly verify authentication via `getAuthenticatedUser()` and scope all database operations using the user's ID.
