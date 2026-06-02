## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-06-12 - [IDOR and Information Leakage in Research & Geolocation APIs]
**Vulnerability:** Research chat deletion and name updates were performed by ID only, without ownership checks. Geolocation API was completely unauthenticated and leaked internal error messages.
**Learning:** API routes providing CRUD operations on user-owned resources must explicitly verify ownership in every destructive or sensitive action. Error handlers must return generic messages to prevent implementation detail leakage.
**Prevention:** Use `getAuthenticatedUser()` to retrieve the current user and always include `userId: user._id || user.id` in Mongoose queries like `findOneAndDelete` or `findOneAndUpdate`. Use generic "Internal Server Error" for 500 responses.
