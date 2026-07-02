## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-07-02 - [BOLA and Missing Auth in Sheet API]
**Vulnerability:** Spreadsheet API endpoints (`get_my_chats` and `create_conversation`) lacked authentication and authorization, allowing unauthorized session access and using a hardcoded 'temp-user'.
**Learning:** New features or modules (like 'Sheet') may be initially implemented with placeholders (like 'temp-user') and missing security middleware, creating significant gaps if not audited before release.
**Prevention:** Establish a security checklist for new API modules that mandates `getAuthenticatedUser()` checks and ownership-scoped database queries (BOLA protection) for all user-specific data.
