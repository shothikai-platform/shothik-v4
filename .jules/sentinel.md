## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [API Key Exposure in Client Hook]
**Vulnerability:** Google Geolocation API key was exposed to the client via `NEXT_PUBLIC_GOOGLE_GEOLOCATION_KEY` in the `useGeolocation` hook.
**Learning:** Prefixing environment variables with `NEXT_PUBLIC_` exposes them to the client bundle. Exposing sensitive keys (like Google API keys without strict restrictions) can lead to quota exhaustion, billing theft, and unauthorized usage.
**Prevention:** Always use server-side routes (e.g., `/api/...`) to securely proxy requests to third-party services that require sensitive credentials.
