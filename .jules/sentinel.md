## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR in Sheet Chat API]
**Vulnerability:** `get_my_chats` endpoint in Sheet Chat API fetched all chats in the database without checking if the user was authenticated or if the chats belonged to the requesting user.
**Learning:** Returning `model.find({})` on an endpoint meant to fetch user-specific data exposes all records globally and leads to severe IDOR and data leakage.
**Prevention:** Always authenticate the user and filter the database query using `{ userId: currentUser._id }` when fetching resources that belong to specific users.
