## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [IDOR and Billing Risks in Multiple API Routes]
**Vulnerability:** Numerous API routes (Sheet, Research, Geolocation, Zoho) lacked authentication and authorization. Key vulnerabilities included IDOR in Research and Sheet features, and a significant billing risk in the Geolocation endpoint which exposed paid Google APIs to unauthenticated users.
**Learning:** Inconsistent application of authentication across feature modules (some routes secured, others not) creates massive security gaps. Publicly accessible proxies to paid external APIs are particularly high-risk.
**Prevention:** Enforce a "Secure by Default" mindset. Every new API route must verify `getAuthenticatedUser()` and restrict database operations to the user's own `userId`. Proxies to external services must be gated by authentication.
