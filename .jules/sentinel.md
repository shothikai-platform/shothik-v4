## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2026-03-07 - Prevent IDOR in PUT updates
**Vulnerability:** The `update_name` endpoint in `src/app/api/research/chat/update_name/[id]/route.ts` allowed unauthenticated IDOR, permitting anyone to update any chat's name by passing an ID to `findByIdAndUpdate`.
**Learning:** Endpoints that mutate state MUST verify authentication AND authorization before executing db queries. Mongoose's `findByIdAndUpdate` makes it easy to forget ownership checks compared to `findOneAndUpdate({ _id, userId })`.
**Prevention:** Always use `getAuthenticatedUser()` in route handlers and use `findOneAndUpdate` scoping queries to include `userId: user._id || user.id`. Additionally, ensure schema properties match payload expectations (e.g. `name` vs `title`).
