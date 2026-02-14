## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Inconsistent Security across Modules]
**Vulnerability:** IDOR in Sheet API despite similar vulnerabilities being previously fixed in Research API.
**Learning:** Security fixes are often applied locally. When a vulnerability pattern is found in one module, it likely exists in other similar modules (e.g., different features with similar CRUD patterns).
**Prevention:** Perform a cross-module audit when a common vulnerability pattern (like IDOR) is identified. Standardize authentication and ownership checks in a reusable way.
