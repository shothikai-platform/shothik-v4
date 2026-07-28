## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-27 - [Auth Bypass and IDOR in Delete Chat API]
**Vulnerability:** The `delete_chat` endpoint was completely unauthenticated and deleted chats solely by MongoDB ObjectId, permitting arbitrary deletion of any chat by unauthorized actors.
**Learning:** Overlooking authentication checks on destructive operations like DELETE endpoints leaves critical state transition pathways fully exposed.
**Prevention:** Enforce mandatory caller identity verification via `getAuthenticatedUser()` and scope deletion queries strictly with the authorized user's ID (`findOneAndDelete({ _id: id, userId: user._id || user.id })`).
