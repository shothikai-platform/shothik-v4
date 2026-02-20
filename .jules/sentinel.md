## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-26 - [Critical IDOR in Research Queue Creation]
**Vulnerability:** The `create_research_queue` endpoint allowed unauthenticated users to inject messages into any chat by ID, bypassing all checks.
**Learning:** API routes in Next.js do not inherit middleware protection automatically unless configured; manual auth checks (`getAuthenticatedUser`) are mandatory in each route handler.
**Prevention:** Verify authentication explicitly at the start of every API route and use scoped queries (`findOne({ _id, userId })`) to prevent IDOR. Note: `delete_chat` and `update_name` were also found vulnerable and require immediate attention.
