## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-24 - [IDOR in Mutation Endpoints (Update/Delete)]
**Vulnerability:** Update and delete endpoints (`update_name` and `delete_chat`) used `findByIdAndUpdate` and `findByIdAndDelete` respectively, allowing any user to modify or delete other users' chats if the `id` was known.
**Learning:** Endpoints that mutate state are equally or more dangerous than read endpoints when missing authorization. The `id` in the URL parameter is inherently untrusted.
**Prevention:** Replace `findByIdAndUpdate` / `findByIdAndDelete` with `findOneAndUpdate` / `findOneAndDelete` and include the user's ID in the query filter (`{ _id: id, userId: user._id }`).
