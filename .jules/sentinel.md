## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-24 - [Unauthenticated API Endpoints leading to IDOR]
**Vulnerability:** Several chat and session management endpoints (`get_my_chats`, `create_conversation`, `create_research_queue`) allowed operations without checking authentication status and utilized `findById` directly without scoping the query to the user's ID.
**Learning:** In frameworks where auth logic is externalized (e.g., using a `getAuthenticatedUser()` utility), it is common for developers to omit the check on less-scrutinized endpoints. Additionally, `findById` bypasses ownership validation.
**Prevention:** Establish a strict pattern where every API route must invoke `getAuthenticatedUser()` and use `findOne({ _id: id, userId: currentUser._id })` instead of `findById` to ensure dual-layer protection (AuthN and AuthZ).
