## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-22 - Prevent IDOR when modifying Background/Streaming Next.js API Routes
**Vulnerability:** A critical IDOR (Insecure Direct Object Reference) vulnerability existed in `src/app/api/research/research/create_research_queue/route.ts` where users could append their search messages to another user's `ResearchChat` simply by passing the target user's `chatId` in the request payload.
**Learning:** This occurred because the endpoint used `ResearchChat.findById(chatId)` to validate the chat, but did not check if the requesting user was authenticated or if the retrieved chat actually belonged to them.
**Prevention:** Always verify `getAuthenticatedUser()` in state-mutating Next.js API endpoints. When finding or updating database documents based on a user-provided ID, scope the query to include the authenticated user's ID (e.g., using `findOne({ _id: chatId, userId: user._id })` and `findOneAndUpdate({ _id: chatId, userId: user._id })` instead of `findById` and `findByIdAndUpdate`).
