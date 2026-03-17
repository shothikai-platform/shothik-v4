## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2025-03-17 - IDOR in Next.js App Router API Handlers
**Vulnerability:** API endpoints handling modification (`PUT`) or deletion (`DELETE`) based on URL `[id]` parameters were not verifying that the authenticated user owned the resource being accessed (e.g. `ResearchChat.findByIdAndDelete(id)` and `findByIdAndUpdate`).
**Learning:** Even if the UI only links to the user's resources, Next.js server actions and API routes are publicly exposed. Mongoose `findById*` methods lack contextual awareness of user scope and rely solely on the database ObjectId.
**Prevention:** Always extract the authenticated `userId` and use ownership-aware query methods like `findOneAndUpdate({ _id: id, userId })` or `findOneAndDelete({ _id: id, userId })` instead of pure `findById*` methods.
