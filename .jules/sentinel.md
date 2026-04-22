## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-26 - [IDOR in Research Chat Deletion]
**Vulnerability:** `delete_chat` endpoint deleted chats by ID using `findByIdAndDelete(id)` without verifying user ownership, allowing any user to delete any other user's chats.
**Learning:** Destructive operations (like DELETE) are critical targets for IDOR and must always include ownership checks. Relying solely on UI obscuration (not showing the delete button to others) is not a security control.
**Prevention:** Always use `findOneAndDelete({ _id: id, userId: currentUser._id })` instead of `findByIdAndDelete(id)` for user-owned resources to enforce authorization at the database level.
