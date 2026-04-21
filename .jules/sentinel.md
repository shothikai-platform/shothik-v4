## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Recurring IDOR in Sheet API]
**Vulnerability:** `get_my_chats` and `create_conversation` in Sheet API lacked authentication and ownership checks, exposing all spreadsheet sessions and allowing unauthorized interaction.
**Learning:** New modules often replicate insecure patterns from earlier ones if not caught by a security audit. Hardcoded "temp-user" placeholders are easy to forget and present a major risk.
**Prevention:** Mandate authentication and ownership filtering for all user-resource endpoints from the start. Use automated tests to verify that unauthorized users receive 401s and cannot access other users' data.
