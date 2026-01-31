## 2026-01-29 - IDOR in Chat Update
**Vulnerability:** IDOR in `src/app/api/research/chat/update_name/[id]/route.ts`. The route allowed unauthenticated users to update any chat's name by ID.
**Learning:** API routes must explicitly filter by `userId` in Mongoose queries (e.g., `findOneAndUpdate({ _id: id, userId: ... })`) to prevent IDOR.
**Prevention:** Always authenticate users (`getAuthenticatedUser`) and enforce ownership in DB queries for user-specific resources.

## 2026-01-30 - IDOR in Research Queue Creation  
**Vulnerability:** IDOR in `src/app/api/research/research/create_research_queue/route.ts`. The route allowed any user to create research for any chat by ID without ownership verification.
**Learning:** Even streaming endpoints must verify resource ownership before processing. Use `findOne({ _id, userId })` instead of `findById`.
**Prevention:** Always authenticate users and verify ownership for all user-specific resources, including streaming/async endpoints.

## 2026-01-31 - IDOR in Get One Chat
**Vulnerability:** The `get_one_chat` endpoint in `src/app/api/research/chat/get_one_chat/[id]/route.ts` allowed accessing any chat by ID without checking the `userId`.
**Learning:** `findById` alone is insufficient for user-scoped resources. Authentication does not imply authorization for a specific resource.
**Prevention:** Always use `findOne({ _id: id, userId: currentUser.id })` for user-specific resources, or explicitly check ownership after fetching.

## 2026-01-31 - IDOR in Delete Chat API
**Vulnerability:** The `DELETE /api/research/chat/delete_chat/[id]` endpoint lacked authentication and authorization checks, allowing any user to delete any chat via `findByIdAndDelete`.
**Learning:** API routes using dynamic IDs (`[id]`) must explicitly validate ownership. `findByIdAndDelete` is dangerous in multi-tenant contexts.
**Prevention:** Always use `findOneAndDelete({ _id: id, userId: currentUser._id })` for user-owned resources and enforce authentication.

## 2026-01-31 - Overly Permissive CORS Policy
**Vulnerability:** The `nlp-inference-service` had an overly permissive CORS policy, allowing requests with any header (`allow_headers=["*"]`). This violates the principle of least privilege.
**Learning:** When implementing a backend security policy change (like CORS), a full audit of the client-side codebase is necessary to understand all possible interactions. Don't just rely on grep - trace API calls to ensure changes won't break features.
**Prevention:** Restrict CORS headers to only those explicitly required (`Content-Type`, `Authorization`). Audit frontend to confirm no other headers are needed before deployment.
