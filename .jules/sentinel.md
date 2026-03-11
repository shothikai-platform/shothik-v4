## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-05-09 - [Missing Auth and Ownership Checks in Mutation Endpoints]
**Vulnerability:** IDOR in API mutation endpoints (e.g., `delete_chat`, `update_name`). Endpoints process mutations using `findByIdAndDelete` or `findByIdAndUpdate` based purely on client-provided IDs without verifying authentication or object ownership.
**Learning:** Endpoints lacked explicit middleware or inline checks using `getAuthenticatedUser()`. This allows any user to guess IDs and modify or delete another user's data.
**Prevention:** Always authenticate the user within the API route first. Then, strictly query for the specific document by combining its `_id` with the authenticated `userId` (e.g., `findOneAndDelete({ _id: id, userId: user._id || user.id })`) to enforce authorization and ownership before performing the mutation.
