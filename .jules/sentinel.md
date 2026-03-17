## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-03-17 - [IDOR in State-Mutating Endpoints]
**Vulnerability:** API endpoints that mutate state (e.g., DELETE, PUT) were using `findByIdAndDelete(id)` or `findByIdAndUpdate(id)` without verifying the user actually owns the resource being manipulated.
**Learning:** This exposes the application to Insecure Direct Object Reference (IDOR) vulnerabilities, where a malicious user could potentially delete or update another user's resources just by providing their ID.
**Prevention:** For state-mutating endpoints, always implement `getAuthenticatedUser()` and verify authorization simultaneously using methods like `findOneAndDelete({ _id: id, userId: user._id || user.id })` rather than simply searching by resource ID.
