## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-04-07 - [IDOR and Missing Auth in Streaming Research API]
**Vulnerability:** `create_research_queue` endpoint allowed unauthenticated users to initiate research and perform IDOR by accessing any `chatId` without ownership verification.
**Learning:** Streaming API routes that perform background database updates must maintain ownership checks throughout the request lifecycle, including during asynchronous operations within the stream.
**Prevention:** Implement `getAuthenticatedUser()` checks at the entry point and use `findOneAndUpdate({ _id: chatId, userId: user._id })` for all database interactions to ensure strictly authorized access.
