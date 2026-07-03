## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.
## 2025-02-15 - [Critical] Exposed YouTube API Key in Client Hooks
**Vulnerability:** The YouTube API key was exposed via `NEXT_PUBLIC_YOUTUBE_API_KEY` directly within the client-side `useYoutubeSubscriber.js` hook. This exposes the key to the public, allowing potential abuse of the YouTube quota.
**Learning:** Client-side React components and hooks cannot safely hold secret keys, even if they are fetching external APIs. Using a Next.js API route (`route.ts`) acts as a secure proxy to hide these keys on the server. Next.js GET routes need caching configurations (like `export const revalidate = 300;`) when acting as proxies, as they might be statically cached at build time.
**Prevention:** Always proxy sensitive external API requests through server-side Next.js route handlers (`src/app/api/...`) rather than fetching directly from the client. Remove the `NEXT_PUBLIC_` prefix for such secrets in the long term.
