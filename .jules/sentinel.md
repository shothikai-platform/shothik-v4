## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-27 - [Hardcoded API Key in Client Hooks]
**Vulnerability:** Google Maps Geolocation API key was hardcoded in `useGeolocation.js` as `process.env.NEXT_PUBLIC_GOOGLE_GEOLOCATION_KEY`, exposing it to the client side.
**Learning:** Prefixing an environment variable with `NEXT_PUBLIC_` automatically bundles it into the client-side JavaScript, exposing sensitive keys to end users.
**Prevention:** Remove `NEXT_PUBLIC_` prefixes for sensitive keys, access them securely in server-side API routes (e.g., `src/app/api/geolocation/route.ts`), and have client-side code make requests to these internal API endpoints instead.
