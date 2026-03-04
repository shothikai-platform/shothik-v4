## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-26 - [IDOR in create_research_queue API]
**Vulnerability:** `create_research_queue` endpoint pushed messages to a chat by fetching only `chatId` using `findById(chatId)`, lacking `getAuthenticatedUser()` checks and user ownership checks, which allowed unauthorized appending to other users' chats.
**Learning:** Action-oriented or queued endpoints are just as vulnerable to IDOR as read/get endpoints and must implement full authentication and ownership validation before appending data or starting jobs.
**Prevention:** Implement `getAuthenticatedUser()` at the start of action endpoints and use scoped queries like `findOne({ _id: chatId, userId: user._id })` to verify ownership prior to mutating data.
