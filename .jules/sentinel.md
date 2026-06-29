## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-06-29 - [IDOR and Authentication in Research API]
**Vulnerability:** Horizontal privilege escalation and missing authentication in `delete_chat` and `update_name` research endpoints.
**Learning:** Some endpoints were implemented without `getAuthenticatedUser()` checks and used `findByIdAndDelete/Update`, allowing any user (or unauthenticated requester) to modify or delete any research chat by ID.
**Prevention:** Enforce mandatory authentication for all user-owned resource mutations and always include `userId` in the document filter for updates and deletions.
