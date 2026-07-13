## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** Multiple Research Chat endpoints (`get_one_chat`, `delete_chat`) lacked authentication and fetched/deleted chats by ID without verifying user ownership.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources. Endpoint specific logic (GET vs DELETE) often share the same vulnerability pattern if not centralized.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: user._id })` or `findOneAndDelete({ _id: id, userId: user._id })`) instead of just using ID-only methods.
