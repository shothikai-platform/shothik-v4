## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-06-05 - [Secret Exposure and Information Leakage in Geolocation]
**Vulnerability:** Google Geolocation API key was exposed on the client-side via `NEXT_PUBLIC_` environment variables. Additionally, the backend proxy endpoint was unauthenticated and leaked detailed internal error messages.
**Learning:** Client-side environment variables are visible to users. Proxying sensitive API calls to the server is necessary but must be accompanied by authentication and generic error handling to prevent resource abuse and further information leakage.
**Prevention:** Move sensitive API calls to authenticated server-side routes and use private environment variables. Implement catch-all error handlers that return generic messages (e.g., "Internal Server Error") to the client.
