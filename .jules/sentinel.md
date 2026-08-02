## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-01 - [IDOR and Input Validation in Research Chat Name Update]
**Vulnerability:** `update_name` endpoint lacked authentication, direct object ownership verification, and name length/type input validation, leaving it vulnerable to IDOR and potential database abuse. Additionally, it incorrectly updated the `title` field instead of the schema-defined `name` field.
**Learning:** API route endpoints that update resource states must verify the identity and ownership of resources before editing them, while applying strict constraints on input structures.
**Prevention:** Always authenticate requests via `getAuthenticatedUser()`, validate incoming inputs for size and types, and use `findOneAndUpdate` scoped to the authenticated user ID for mutating database operations.
