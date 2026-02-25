## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR in Research Queue Creation]
**Vulnerability:** `create_research_queue` endpoint accepted arbitrary `chatId` to trigger research without checking ownership, allowing modification of other users' chats and potential resource exhaustion.
**Learning:** Action-based endpoints (POST/PUT) are critical IDOR targets because they modify state. Read-only IDOR is bad, but write-based IDOR can corrupt data or trigger expensive background jobs.
**Prevention:** Always scope `findOne` or `findOneAndUpdate` with `userId` for any resource modification. Validate ownership before triggering downstream processes.
