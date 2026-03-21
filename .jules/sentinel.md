## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## $(date +%Y-%m-%d) - Fix IDOR in get_my_chats endpoint
**Vulnerability:** The `src/app/api/sheet/chat/get_my_chats/route.ts` endpoint queried `SheetSession.find({})` without checking authentication or filtering by user ID, effectively returning all chat sessions across the platform (Data Leakage / IDOR).
**Learning:** This existed because the `getAuthenticatedUser` and filtering logic was completely omitted from this specific endpoint.
**Prevention:** Always use `getAuthenticatedUser` on API endpoints that return user-specific data and ensure the database queries are correctly scoped to the `userId`.
