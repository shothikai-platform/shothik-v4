## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-05-24 - [Auth and IDOR in Research Chat Update]
**Vulnerability:** The `update_name` API route for research chats was completely unauthenticated and used `findByIdAndUpdate` without ownership verification, allowing anyone to rename any chat.
**Learning:** Even "minor" endpoints like renaming can be overlooked during security audits. The endpoint also had a field mismatch (`title` vs `name`), which often indicates rushed development where security checks are missed.
**Prevention:** Standardize a middleware or a helper function for all user-resource mutations that enforces both `getAuthenticatedUser()` and `userId` scoping in the database query.
