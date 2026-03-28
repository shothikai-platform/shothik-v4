## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-04-18 - [Missing Authorization in Sheet Sessions API]
**Vulnerability:** Insecure Direct Object Reference (IDOR) and missing authentication in the `get_my_chats` endpoint for sheet sessions, which returned all user data.
**Learning:** Reusing existing models and controllers without copying the authorization logic leads to silent but critical security gaps. "Get My X" endpoints must always be explicitly scoped to the user ID.
**Prevention:** Standardize a set of "Secure Query" utilities or higher-order functions to wrap database calls, ensuring `userId` is always included when fetching user-specific resources.
