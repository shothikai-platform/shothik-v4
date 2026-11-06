## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-10-18 - [Missing Authentication and IDOR in Delete Research Chat API]
**Vulnerability:** `delete_chat` endpoint deleted chats by ID without checking authentication or verifying user ownership, allowing anyone to delete any chat.
**Learning:** API routes must explicitly check for authenticated users and ensure the resource being modified or deleted belongs to them, especially on destructive operations like DELETE.
**Prevention:** Always verify authentication at the beginning of the route handler and scope database queries with `userId` (e.g., `findOneAndDelete({ _id: id, userId: currentUser._id })`) instead of just `findByIdAndDelete(id)`.
