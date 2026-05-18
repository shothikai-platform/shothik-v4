## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-28 - [XSS via dangerouslySetInnerHTML in Shared Content]
**Vulnerability:** User-provided markdown content was rendered directly using `dangerouslySetInnerHTML` in the `SharedContentPage` without any sanitization, allowing for arbitrary JavaScript execution (Stored XSS).
**Learning:** Next.js Server-Side Rendered (SSR) components require a DOM purifier that works in node environments, otherwise standard `dompurify` throws a `window is not defined` error.
**Prevention:** Always install and use `isomorphic-dompurify` when sanitizing HTML strings to be injected via `dangerouslySetInnerHTML` in React/Next.js to ensure safe rendering on both the server and client.
