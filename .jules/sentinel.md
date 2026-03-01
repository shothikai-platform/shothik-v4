## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-03-01 - [IDOR in update_name API endpoint]
**Vulnerability:** The `src/app/api/research/chat/update_name/[id]/route.ts` API endpoint used `findByIdAndUpdate` with only the `id` from the path parameter, allowing any user to modify any other user's chat name. It also completely lacked authentication. Additionally, it attempted to update a `title` field instead of the schema-defined `name` field, which failed silently because Mongoose `strict: true` behavior ignores undefined fields.
**Learning:** Always verify that an object belongs to the requesting user before performing operations on it, and ensure the schema fields match the payload being updated. Relying solely on the object's unique ID for updates is inherently vulnerable to IDOR. Also, when using Next.js route handlers, Mongoose queries need to explicitly scope the queries with `userId: user._id`.
**Prevention:**
1. Always require authentication using `getAuthenticatedUser()` in protected routes.
2. Use `findOneAndUpdate({ _id: id, userId: user._id }, ...)` instead of `findByIdAndUpdate` to implicitly verify ownership.
3. Validate request bodies against the actual Mongoose schema (e.g. `name` vs `title`).
