## 2025-05-23 - [Attack Surface Reduction: Unused Endpoints]
**Vulnerability:** Unused and unauthenticated API endpoints (`/api/geolocation` and `/api/zoho-webhook`) existed in the codebase, potentially exposing server-side logic and environment variables.
**Learning:** Dead code is a security risk. Unmaintained endpoints often lack security controls and can be exploited even if the frontend doesn't use them.
**Prevention:** Regularly audit API routes and remove unused ones. Use tools like `grep` to verify usage before deletion.

## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
