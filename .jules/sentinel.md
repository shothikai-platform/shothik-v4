## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Insecure Deletion and Message Injection in Research Chat]
**Vulnerability:** IDOR in `delete_chat`, `update_name`, and `create_research_queue` allowed unauthorized users to delete chats, rename them, or inject messages into other users' research sessions.
**Learning:** Even internal-looking endpoints like "queueing" or "background processing" triggers can be vulnerable if they are exposed as public API routes and lack ownership verification.
**Prevention:** Every API route that modifies or accesses user-specific data must authenticate the user and verify ownership of the target resource, regardless of the operation type.
