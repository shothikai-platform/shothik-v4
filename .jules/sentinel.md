## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-03-24 - [Fix API Key Exposure in Client Hook]
**Vulnerability:** Google Geolocation API Key was exposed on the client side via the `NEXT_PUBLIC_GOOGLE_GEOLOCATION_KEY` environment variable in the `useGeolocation` hook.
**Learning:** The project has a pattern where some client-side hooks inappropriately expose API keys using `NEXT_PUBLIC_` prefixes.
**Prevention:** These should be mitigated by routing calls through server-side Next.js API endpoints instead, as done for the geolocation API.
