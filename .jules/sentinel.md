## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2026-03-15 - [Missing Authorization in SheetSession Endpoint]
**Vulnerability:** The `src/app/api/sheet/chat/get_my_chats/route.ts` endpoint originally queried all sessions globally using `SheetSession.find({})` without validating the authenticated user, resulting in a severe IDOR (Insecure Direct Object Reference) and data leakage risk.
**Learning:** Some GET endpoints designed to fetch user-specific lists might accidentally be implemented as generic global queries if authentication checks are skipped during rapid development.
**Prevention:** Always ensure any endpoint returning user-specific data utilizes `getAuthenticatedUser()` and appends the `userId` filter to the resource query. Additionally, always write tests specifically asserting that an unauthorized user cannot fetch other users' data.
