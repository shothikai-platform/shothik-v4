## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-01 - [Missing Authentication and IDOR in Research Chat Mutation Endpoints]
**Vulnerability:** `update_name` and `delete_chat` endpoints lacked authentication checks and IDOR protection, allowing anyone to modify or delete any user's research chat via their ID.
**Learning:** Mutative operations (PUT, DELETE) must strictly verify identity using `getAuthenticatedUser()` and authorize operations using scoped Mongo queries (e.g. `findOneAndUpdate` and `findOneAndDelete` including both chat `id` and authenticated `userId`).
**Prevention:** Standardize authorization and input sanitization/length restrictions on all user-input endpoints. Ensure unit tests are in place to explicitly test unauthorized and cross-user modification scenarios.
