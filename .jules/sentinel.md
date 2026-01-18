## 2025-02-18 - Unprotected Dynamic Routes in Research Chat API
**Vulnerability:** IDOR (Insecure Direct Object Reference) and Missing Authentication in `get_one_chat`, `update_name`, and `delete_chat` endpoints.
**Learning:** Next.js dynamic routes (`[id]/route.ts`) were fetching/updating resources solely by `id` from URL params without validating the session user or checking ownership.
**Prevention:** Always use `getAuthenticatedUser()` to validate session and strictly use `findOne({ _id: id, userId: user._id })` pattern instead of `findById(id)` for user-owned resources.
