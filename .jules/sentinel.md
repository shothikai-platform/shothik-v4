## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-06-12 - [XSS Protection in SSR/CSR Environments]
**Vulnerability:** XSS vulnerability in blog article rendering where external content was rendered via `dangerouslySetInnerHTML` without sanitization.
**Learning:** Standard client-side sanitization libraries like `dompurify` may be bypassed during the initial Server-Side Rendering (SSR) phase in Next.js if not properly implemented, or may crash the server if they rely on `window`.
**Prevention:** Use `isomorphic-dompurify` for all HTML sanitization in Next.js components to ensure consistent protection across both server-side and client-side rendering.
