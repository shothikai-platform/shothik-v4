## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2025-03-09 - Client-Side API Key Exposure via Hook Proxied through Backend Route
**Vulnerability:** The `useGeolocation` hook directly requested the Google Geolocation API from the client using `NEXT_PUBLIC_GOOGLE_GEOLOCATION_KEY`, which publicly exposed the API key.
**Learning:** In Next.js applications, sensitive keys should not use the `NEXT_PUBLIC_` prefix unless they are strictly restricted by HTTP Referrers in the cloud console. When shifting away from exposed keys, calls must be routed through server-side Next.js API endpoints (e.g. `/api/geolocation`) to keep the key completely out of the client bundle.
**Prevention:** Avoid `NEXT_PUBLIC_` for sensitive API credentials. proxy client-side data fetches through Next.js server actions or API endpoints using `process.env.YOUR_API_KEY`.
