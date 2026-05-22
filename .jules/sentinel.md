## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-26 - [Complete IDOR Protection for Research Chat]
**Vulnerability:** `delete_chat` endpoint was missing authentication and ownership checks, allowing any user to delete any chat via IDOR.
**Learning:** Security fixes must be applied consistently across all CRUD operations for a resource. Fixing GET but leaving DELETE vulnerable is a common oversight.
**Prevention:** Use a unified authentication and authorization pattern for all resource-specific API routes. Ensure `findOneAndDelete` and `findOneAndUpdate` also include `userId` in the filter.
