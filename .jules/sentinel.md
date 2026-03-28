## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR in Mutative Endpoints (Update/Delete)]
**Vulnerability:** IDOR in API routes for updating and deleting `ResearchChat` resources (`update_name` and `delete_chat`) via `findByIdAndUpdate` and `findByIdAndDelete`.
**Learning:** Mutative endpoints are critical. While read IDORs leak data, mutative IDORs allow data corruption and destruction. Missing authorization checks on `findByIdAnd...` methods bypass ownership validation.
**Prevention:** Never use `findByIdAndUpdate` or `findByIdAndDelete` for user-owned resources without explicit authorization checks. Use `findOneAndUpdate` and `findOneAndDelete` and scope the query with `{ _id: id, userId: currentUser._id }`.
