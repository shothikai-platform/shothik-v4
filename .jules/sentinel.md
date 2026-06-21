## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Missing Auth and IDOR in Research Chat Management]
**Vulnerability:** `update_name` and `delete_chat` endpoints were completely unauthenticated and lacked ownership checks, allowing any user (or non-user) to modify or delete any research chat by ID.
**Learning:** Critical resource management endpoints (PUT/DELETE) are sometimes overlooked during security hardening if they are added later or perceived as "internal".
**Prevention:** Every API route handling user-owned data must start with an authentication check and use ownership-scoped database queries (e.g., `findOneAndUpdate({ _id, userId })`).
