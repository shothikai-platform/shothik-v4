## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-06-17 - [XSS Prevention in Shared Content Rendering]
**Vulnerability:** Cross-Site Scripting (XSS) via unsanitized HTML content rendered using `dangerouslySetInnerHTML` in Shared Content page.
**Learning:** Next.js "use client" components still undergo server-side rendering, which can leak unsanitized content if sanitization only happens in `useEffect`. Using a state-based fallback like `sanitizedContent || content.content` is unsafe because it can render the unsanitized content during the initial render or SSR.
**Prevention:** Always sanitize content before passing it to `dangerouslySetInnerHTML`. Ensure that only sanitized state is used for rendering, and avoid falling back to raw user input.
