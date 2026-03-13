## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## $(date +%Y-%m-%d) - Missing authentication and IDOR in endpoint
**Vulnerability:** The `get_my_chats` endpoint in `src/app/api/sheet/chat/get_my_chats/route.ts` was missing authentication checks and queried all `SheetSession` records without scoping them to the authenticated user's ID, resulting in unauthorized access to other users' data (IDOR).
**Learning:** Endpoints that fetch user-specific data must always verify `getAuthenticatedUser()` and enforce query filters like `{ userId: user._id || user.id }` to prevent IDOR and data leakage.
**Prevention:** Always verify authentication and user-specific scopes on endpoints fetching resource lists, especially inside the `/api/` directory. Furthermore, enforce `.lean()` on read-only queries.
