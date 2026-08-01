## 2025-06-03 - [IDOR & Unauthenticated Access in Research Chat Operations]
**Vulnerability:** The `update_name` and `delete_chat` endpoints were completely unauthenticated and allowed arbitrary reading/mutation of database chat documents by ID, causing a major IDOR risk.
**Learning:** Legacy endpoints or newly added routes might lack the global middleware or decorators usually responsible for authentication, exposing them to direct API requests.
**Prevention:** Explicitly invoke authentication helpers like `getAuthenticatedUser()` in every API route handler, and enforce object ownership scoping in Mongoose queries (e.g. `findOneAndUpdate` and `findOneAndDelete` with user ID filters).

## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
