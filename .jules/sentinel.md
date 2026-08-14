## 2025-05-23 - [Authentication, IDOR, and Input Validation in Research Chat]
**Vulnerability:** Insecure Direct Object Reference (IDOR), Missing Authentication, and Missing Input Validation on the chat renaming endpoint (`update_name/[id]`).
**Learning:** Endpoints that mutate resources based on a URL ID must verify both the user's authentication status and their ownership of the specific resource. Lacking input length constraints also exposes the API to DoS or database bloat.
**Prevention:** Use a robust authentication wrapper, scope queries using the user's ID (e.g., `findOneAndUpdate({ _id: id, userId: user._id })`), and enforce strict string validation/length constraints on any request body payloads.

## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
