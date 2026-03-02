## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-03-01 - IDOR in Delete Endpoint
**Vulnerability:** Insecure Direct Object Reference (IDOR) and unauthenticated access in `src/app/api/research/chat/delete_chat/[id]/route.ts`. The endpoint allowed anyone to delete any ResearchChat by ID without verifying authentication or ownership.
**Learning:** Destructive operations (DELETE) and read/write operations on specific resource IDs must explicitly verify both that a user is authenticated and that the resource belongs to them using a scoped query (e.g. `findOneAndDelete({ _id: id, userId: user._id })`).
**Prevention:** Always use `getAuthenticatedUser` to check auth, and query resources combining the object ID and the user's ID rather than just `findByIdAndDelete` or `findByIdAndUpdate`.
