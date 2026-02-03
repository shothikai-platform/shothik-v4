## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Incomplete Security Sweeps in Research Chat API]
**Vulnerability:** IDOR and missing authentication in `delete_chat`, `update_name`, and `create_research_queue` endpoints, despite a previous fix in `get_one_chat`.
**Learning:** Fixing a vulnerability in one endpoint (e.g., GET) does not automatically secure related endpoints (POST, PUT, DELETE) in the same module. Developers often copy-paste insecure patterns.
**Prevention:** When a vulnerability is found in one endpoint, conduct a comprehensive audit of all related endpoints in the same feature/module to ensure the fix is applied consistently.
