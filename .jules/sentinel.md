## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-27 - [XSS via dangerouslySetInnerHTML and marked]
**Vulnerability:** User input (message content) was rendered directly to the DOM using `dangerouslySetInnerHTML={{ __html: marked(message) }}` in a Next.js client component without any sanitization.
**Learning:** `marked` alone does not sanitize input, and Next.js requires an SSR-safe sanitizer (`isomorphic-dompurify`) because standard `dompurify` relies on the `window` object, which is undefined during server-side rendering.
**Prevention:** Always sanitize dynamically generated HTML from markdown using `isomorphic-dompurify.sanitize()` before passing it to `dangerouslySetInnerHTML`.
