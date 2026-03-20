## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-05-30 - Prevent IDOR when modifying ResearchChat documents
**Vulnerability:** The endpoints to update the name (`update_name`) and delete (`delete_chat`) a `ResearchChat` were vulnerable to Insecure Direct Object Reference (IDOR). They used `findByIdAndUpdate` and `findByIdAndDelete` respectively without authenticating the user or verifying ownership of the chat document.
**Learning:** In MongoDB/Mongoose API routes handling mutable actions, blindly trusting an ID from the route path is a critical risk, enabling unauthenticated or unauthorized users to alter others' data.
**Prevention:** Always authenticate the user (`getAuthenticatedUser()`) on mutating endpoints and enforce ownership checks using a multi-condition query like `findOneAndUpdate({ _id: id, userId: user._id || user.id }, ...)`. Never use `findByIdAnd[Action]` without a subsequent or integrated ownership authorization step.
