## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-05-30 - [IDOR in create_research_queue endpoint]
**Vulnerability:** The API endpoint `src/app/api/research/research/create_research_queue/route.ts` processed chat requests utilizing `findById(chatId)` based exclusively on client-provided IDs without any user validation or checking if the chat actually belonged to the requester.
**Learning:** This existed because of missing authentication implementation. When endpoints interact with specific document IDs, assuming the user ID from context is handled upstream isn't enough; the database query must explicitly join or verify the ownership.
**Prevention:** Always authenticate the incoming request first, and use `findOne({ _id: documentId, userId: user._id || user.id })` rather than `findById(documentId)` when modifying or accessing private user resources.
