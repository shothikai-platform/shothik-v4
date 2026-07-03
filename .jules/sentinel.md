## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-07-03 - [Client-side API Key Leak in Hooks]
**Vulnerability:** YouTube API key was exposed to the client bundle via `NEXT_PUBLIC_YOUTUBE_API_KEY` in the `useYoutubeSubscriber` hook.
**Learning:** Next.js exposes any environment variable prefixed with `NEXT_PUBLIC_` to the browser. Relying on client-side fetching for third-party APIs often inadvertently leaks secrets.
**Prevention:** Always create a secure, server-side API route (e.g., `/api/youtube-subscriber`) to wrap third-party API calls, and have the client fetch from this internal route using server-only environment variables.
