## 2025-02-27 - [IDOR in Sheet Chat APIs]
**Vulnerability:** `get_my_chats` endpoint exposed ALL session data without user filtering. `create_conversation` allowed anonymous `temp-user` creation which was then exposed.
**Learning:** Broken/demo features are often the most vulnerable. "Temp" placeholders often make it into production.
**Prevention:**
1. Default to "safe failure": Return `[]` instead of 401 for list endpoints to avoid breaking UI while securing data.
2. Require auth for writes: Do not allow anonymous users to create persistent data (DoS/Abuse risk).
3. Validate IDs: `findById` can throw CastError for invalid strings; use try/catch or validate format.

## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
