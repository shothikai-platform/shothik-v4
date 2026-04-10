## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-04-10 - [IDOR & Unauthenticated Access in Sheet and Research APIs]
**Vulnerability:** `create_conversation`, `get_my_chats`, and `create_research_queue` APIs allowed unauthenticated access, assigned a hardcoded `temp-user` identifier, and suffered from Insecure Direct Object References (IDOR).
**Learning:** Relying on frontend integration or temporary variables rather than authenticating the session consistently leads to critical data exposure. Hardcoded bypasses must be treated as critical findings.
**Prevention:** Apply `getAuthenticatedUser()` universally across all API endpoints containing PII, user-generated content, or operational data, ensuring user ownership logic (`userId`) matches the actual authenticated session.
