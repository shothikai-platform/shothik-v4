## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Incomplete IDOR Protection in Research Chat API]
**Vulnerability:** Mutation endpoints (`update_name`, `delete_chat`) lacked authentication and IDOR protection, while the query endpoint (`get_one_chat`) was previously secured.
**Learning:** Security fixes must be applied comprehensively across all related endpoints (CRUD); fixing the GET endpoint does not automatically protect the PUT/DELETE endpoints.
**Prevention:** Audit all endpoints in a module when a vulnerability is found in one; prefer `findOneAndUpdate`/`findOneAndDelete` with ownership filters over `findByIdAnd...`.
