## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2024-07-05 - [Prevent Google Geolocation API Key Exposure]
**Vulnerability:** The Google Geolocation API key (`NEXT_PUBLIC_GOOGLE_GEOLOCATION_KEY`) was being exposed in client-side code through a React hook (`useGeolocation.js`).
**Learning:** Client-side React hooks in this Next.js app were incorrectly using `NEXT_PUBLIC_` prefixed keys to directly interact with external secure APIs.
**Prevention:** Always route external API calls that require secrets through secure server-side Next.js route handlers (`/api/...`) and use server-side environment variables without the `NEXT_PUBLIC_` prefix.
