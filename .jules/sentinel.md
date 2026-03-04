## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2025-03-04 - [CRITICAL] Fix IDOR and Unauthenticated Access in Spreadsheet Chat API
**Vulnerability:** The `/api/sheet/conversation/create_conversation` endpoint allowed any user to create new chat sessions with a hardcoded `temp-user` ID, and more dangerously, allowed unauthenticated or unauthorized users to append messages to and modify the title of *any* existing `SheetSession` simply by passing its `chatId` in the request body.
**Learning:** This existed because the initial implementation prioritized getting the functionality (LLM streaming) working without integrating the application's existing `getAuthenticatedUser()` middleware. It assumed `chatId` was sufficient to update a session, neglecting ownership verification (IDOR).
**Prevention:** All API routes that interact with user-specific data (especially Mongoose `findById`/`findOne` or `create`) MUST begin by verifying the user's identity via `getAuthenticatedUser()`. When looking up an existing record by an ID provided by the client, always scope the query to include the authenticated user's ID (e.g., `findOne({ _id: chatId, userId: user._id })`) rather than trusting the object ID alone.
