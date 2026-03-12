## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2026-03-12 - [HIGH] Fix authentication and IDOR in SheetSession get_my_chats endpoint
**Vulnerability:** The `src/app/api/sheet/chat/get_my_chats` endpoint lacked authentication and access control, allowing any user to fetch all sheet sessions without verification (`SheetSession.find({})`).
**Learning:** In read-only endpoints returning user-specific lists, always ensure `getAuthenticatedUser` is enforced and `userId` is strictly bounded. Missing this exposes all internal user session metadata.
**Prevention:** In Next.js route handlers, strictly begin every user-specific data fetch with an authentication check and apply a `userId` filter constraint on the database query. Also add `.lean()` to prevent large object serialization overheads.
