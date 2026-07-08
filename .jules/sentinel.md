## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-07-08 - [XSS in Shared Content Rendering]
**Vulnerability:** User-controlled content rendered via `dangerouslySetInnerHTML` without sanitization in `SharedContentPage`, allowing Cross-Site Scripting (XSS).
**Learning:** The application uses `dangerouslySetInnerHTML` in multiple places for Markdown rendering, but lacks a centralized or consistent sanitization strategy. Sanitization must be handled carefully in Next.js to avoid SSR hydration mismatches.
**Prevention:** Always use `DOMPurify` (or a similar library) to sanitize HTML before using `dangerouslySetInnerHTML`. In Next.js, perform sanitization within `useEffect` or use an isomorphic library to ensure consistency between server and client rendering.
