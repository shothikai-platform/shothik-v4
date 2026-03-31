## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-03-31 - [Insecure Direct Object Reference (IDOR) via Mongoose findById*]
**Vulnerability:** User-specific API endpoints used Mongoose's `findById`, `findByIdAndUpdate`, and `findByIdAndDelete` methods directly without verifying if the requested resource belonged to the authenticated user, allowing any authenticated user to read, modify, or delete any resource by its ID.
**Learning:** In multi-tenant environments with user-specific resources, Mongoose `findById*` methods inherently lack authorization checks and should be avoided in user-facing endpoints.
**Prevention:** Use `findOne`, `findOneAndUpdate`, and `findOneAndDelete` instead, appending `{ userId: user._id || user.id }` to the query to restrict access to the authenticated resource owner.
