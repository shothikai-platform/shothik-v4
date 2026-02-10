## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in User Resource APIs]
**Vulnerability:** Multiple endpoints in Research Chat and Sheet Conversation APIs (e.g., `delete_chat`, `update_name`, `create_conversation`) fetched or modified resources by ID without verifying user ownership.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources. Even resource creation must be scoped to the authenticated user rather than using hardcoded placeholders like 'temp-user'.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) and ensure all new records are linked to the authenticated user.
