## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-04-01 - [IDOR in Sheet Chat API]
**Vulnerability:** `get_my_chats` endpoint for Sheet sessions fetched all sessions from the database without any user filtering, exposing all users' chat history to any authenticated (or even unauthenticated) user.
**Learning:** New feature modules (like Sheet) often duplicate patterns from older modules but might miss critical security checks if they aren't part of a shared, secured base controller or middleware.
**Prevention:** Enforce authentication and user-specific data isolation (filtering by `userId`) at the start of every API route handler that deals with private user data.
