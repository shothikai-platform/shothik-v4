## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-07-09 - [XSS Prevention in Next.js SSR]
**Vulnerability:** Cross-Site Scripting (XSS) via `dangerouslySetInnerHTML` on pages with Server-Side Rendering (SSR) when sanitization is bypassed on the server.
**Learning:** Browsers may execute malicious scripts in the initial unsanitized HTML payload before hydration. Using `typeof window !== 'undefined'` to skip sanitization on the server leaves the app vulnerable during initial load and causes hydration mismatches.
**Prevention:** Use a mounted state (e.g., `isMounted` via `useEffect`) to ensure `dangerouslySetInnerHTML` only renders sanitized content on the client, while keeping it empty or using a safe placeholder during SSR.
