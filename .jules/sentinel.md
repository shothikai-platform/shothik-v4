## 2025-10-24 - [IDOR and Missing Auth in Chat Update API]
**Vulnerability:** `update_name` chat endpoint allowed unauthenticated, unauthorized users to modify chat names due to lack of `getAuthenticatedUser` check and use of `findByIdAndUpdate`. It also had a bug where the `name` field was mapped incorrectly to a non-existent `title` field in the database.
**Learning:** Endpoints that modify resources (e.g., PUT or PATCH) are high-priority targets for attackers and must check both session authentication and owner authorization.
**Prevention:** Always verify authentication, query using IDOR-safe filters (e.g. `findOneAndUpdate({ _id: id, userId: user._id })`), validate input payload types/lengths, and ensure schema alignment.

## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
