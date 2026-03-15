## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-05-18 - [Missing Auth and IDOR in Mutating API Endpoints]
**Vulnerability:** The `/api/research/research/create_research_queue` endpoint was missing authentication completely, allowing anyone to start research queues. It also used `findById()` and `findByIdAndUpdate()` without verifying the `userId`, allowing any user to add messages to another user's research chat via IDOR.
**Learning:** API routes that perform state mutations (like creating a queue or updating a chat) require strict authentication and authorization checks, especially ensuring that the queried or updated document belongs to the authenticated user.
**Prevention:** Always verify authentication at the beginning of API routes using `getAuthenticatedUser()`. Replace simple ID-based queries (e.g., `findById(id)`) with explicit ownership checks (e.g., `findOne({ _id: id, userId: user._id || user.id })`) to prevent IDOR vulnerabilities.
