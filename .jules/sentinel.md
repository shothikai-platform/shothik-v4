## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
\n## 2024-03-01 - Missing Auth/IDOR in Mongoose findByIdAndDelete\n**Vulnerability:** The API endpoint `/api/research/chat/delete_chat/[id]` used `findByIdAndDelete(id)` directly with unauthenticated requests, allowing anyone to delete any chat if they knew the chat ID.\n**Learning:** Mongoose's `findByIdAndDelete` does not apply authorization scoping. Using this for user-owned resources creates an immediate IDOR vulnerability, particularly when the endpoint also misses authentication checks.\n**Prevention:** Endpoints that modify resources must first verify `getAuthenticatedUser()`. Then, use `findOneAndDelete({ _id: id, userId: user._id || user.id })` or `findOneAndUpdate` to combine resource locating and ownership verification into a single atomic query.
