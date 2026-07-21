## 2025-11-20 - [XSS on Public Shared Content Page]
**Vulnerability:** Persistent Cross-Site Scripting (XSS) via `dangerouslySetInnerHTML` on the public shared content page where arbitrary user-supplied Markdown/HTML was rendered without sanitization.
**Learning:** Shared content links are accessible to any user without authentication. If a malicious user injects scripts into their content, anyone opening the shared link will execute that script in their browser session.
**Prevention:** Always sanitize dynamic HTML inputs using `DOMPurify` before rendering via `dangerouslySetInnerHTML`. Use the `isMounted` state pattern in SSR frameworks like Next.js to ensure sanitization runs reliably on the client side without causing hydration mismatches.

## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
