## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR and DoS in Streaming Research API]
**Vulnerability:** `create_research_queue` was completely unauthenticated and fetched/updated research chats by ID without ownership verification. It also lacked query length validation.
**Learning:** Asynchronous operations (like those inside a `ReadableStream` controller) must also respect security boundaries. It's easy to overlook ownership checks in follow-up updates after the initial request validation.
**Prevention:** Always verify authentication at the start of the route. Use ownership-scoped queries (`findOne`, `findOneAndUpdate`) for ALL database interactions involving user-owned resources, including those inside streaming callbacks. Implement strict input length limits to prevent resource exhaustion (DoS).
