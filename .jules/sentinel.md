## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-03-26 - Fix Critical IDOR Vulnerabilities in Chat APIs
**Vulnerability:** Insecure Direct Object Reference (IDOR) vulnerabilities were present in `src/app/api/research/chat/update_name/[id]/route.ts`, `src/app/api/research/chat/delete_chat/[id]/route.ts`, and `src/app/api/sheet/chat/get_my_chats/route.ts`. The endpoints were using functions like `findByIdAndUpdate`, `findByIdAndDelete`, and `find({})` respectively without authenticating the user making the request or verifying their authorization against the targeted resource ID.
**Learning:** This existed because the codebase lacked explicit user authorization checks in these specific routes, likely assuming that the frontend UI inherently limits access (security by obscurity).
**Prevention:** Always authenticate requests by utilizing the `getAuthenticatedUser()` helper function. Apply the returned user's `_id` to authorization filters such as `userId: user._id || user.id` in Mongoose queries (e.g., using `findOneAndUpdate` over `findByIdAndUpdate`). Never trust the client to restrict access to IDs.
