## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Insecure Direct Object Reference (IDOR) in Research Update API]
**Vulnerability:** The `update_name` research API allowed unauthenticated and unauthorized updates to any chat by its ID, and incorrectly used the field `title` instead of `name`.
**Learning:** Many API routes in this codebase were implemented as prototypes and lack basic authentication and authorization (IDOR) checks. Field names in routes sometimes mismatch the Mongoose schema.
**Prevention:** Use `getAuthenticatedUser()` in all user-facing API routes and always include `userId` in Mongoose update/delete queries to enforce ownership. Verify schema field names before implementing updates.
