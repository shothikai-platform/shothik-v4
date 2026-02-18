## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-24 - [Module-Specific IDOR Oversight]
**Vulnerability:** Entire functional modules (e.g., Sheet API) were implemented without any authentication or authorization checks, leaking all data and allowing unauthorized modifications.
**Learning:** Security debt can accumulate in newer or less-audited modules even if core modules are secured. Consistency across the entire API surface is critical.
**Prevention:** Audit all API routes periodically and ensure that every new feature starts with a base layer of authentication and ownership checks.
