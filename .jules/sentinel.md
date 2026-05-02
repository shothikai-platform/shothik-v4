## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR and DoS in Research Queue API]
**Vulnerability:** Lack of authentication and ownership verification in the `create_research_queue` endpoint allowed any user to trigger research for any chat ID. Also, lack of input validation on the research query posed a DoS risk.
**Learning:** Even internal-looking or "queue" endpoints must be fully secured if they are exposed as public API routes. Input length limits are critical for resource-intensive operations like research.
**Prevention:** Ensure every API route starts with an authentication check and verify resource ownership before performing any state-changing operations.
