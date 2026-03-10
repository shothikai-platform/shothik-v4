## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR in Mutating Operations via findByIdAndUpdate/Delete]
**Vulnerability:** Mutating operations (`update_name` and `delete_chat`) lacked authorization, executing updates and deletes based purely on the `id` param using `findByIdAndUpdate` and `findByIdAndDelete`. This is a classic IDOR vulnerability leading to unauthorized data modification/destruction.
**Learning:** Adding authentication (`getAuthenticatedUser()`) is step one, but the query itself must be scoped. The difference between reading and mutating is critical, as a missing authorization check on a mutation can destroy data irrecoverably.
**Prevention:** Always verify resource ownership in Mongoose queries using `findOneAndUpdate({ _id: id, userId: currentUser._id })` and `findOneAndDelete({ _id: id, userId: currentUser._id })`. Never use `findByIdAndUpdate` or `findByIdAndDelete` for user-owned resources on public-facing APIs.
