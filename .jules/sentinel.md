## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-05-07 - [IDOR and Missing Auth in Research Chat Update]
**Vulnerability:** `update_name` endpoint was completely unauthenticated and used `findByIdAndUpdate`, allowing any user (or even unauthenticated visitors) to rename any chat session by ID.
**Learning:** New endpoints can easily be overlooked during security reviews if they are added without standard middleware or auth checks.
**Prevention:** Implement a consistent security review for all new API routes and use `findOneAndUpdate` with `userId` as a standard pattern for resource updates.
