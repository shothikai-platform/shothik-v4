## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Insecure Resource Management in Research Chat]
**Vulnerability:** IDOR (Insecure Direct Object Reference) in Research Chat DELETE and UPDATE_NAME endpoints.
**Learning:** Even if an endpoint is authenticated, it must verify that the resource being modified or deleted belongs to the authenticated user. Using `findByIdAndDelete` or `findByIdAndUpdate` without a `userId` check is dangerous.
**Prevention:** Use atomic Mongoose operations like `findOneAndDelete` or `findOneAndUpdate` and include `userId` in the filter criteria.
