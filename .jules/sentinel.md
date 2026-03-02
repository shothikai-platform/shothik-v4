## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-03-02 - [IDOR and Silent Update Failure in Research Chat Update API]
**Vulnerability:** The `update_name` API allowed unauthenticated users and unauthorized users to update any chat due to using `findByIdAndUpdate` without checking the `userId`. Furthermore, Mongoose `strict: true` silently masked a schema field mismatch (`title` vs `name`), failing to perform the update.
**Learning:** Updates require both strict authentication/authorization checks and exact schema matching. Mongoose's silent strict mode failures make testing crucial.
**Prevention:** Always use `findOneAndUpdate({ _id: id, userId: currentUser._id }, ...)` instead of `findByIdAndUpdate`, and ensure request payloads strictly match the defined Mongoose schema fields to avoid silent omissions.
