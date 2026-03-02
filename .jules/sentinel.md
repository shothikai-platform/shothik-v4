## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-18 - Unauthenticated Geolocation API Endpoint
**Vulnerability:** The `src/app/api/geolocation/route.ts` endpoint was completely unauthenticated. Although seemingly unused directly by the client (client uses Google API directly with public key and fallback), the server-side endpoint wraps Google API calls using the server-side `GOOGLE_GEOLOCATION_KEY` and was exposed to the public internet. This allowed arbitrary, unauthenticated calls to consume the server's API quotas and potentially incur costs.
**Learning:** Dormant or wrapper APIs often miss authentication checks when originally intended for internal use but left exposed as public Next.js API routes.
**Prevention:** All `/api/*` endpoints should securely verify the caller's identity (e.g., using `getAuthenticatedUser()`) by default unless specifically designed to be public (like webhooks, which should still have signature validation).
