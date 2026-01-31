## 2026-01-29 - IDOR in Chat Update
**Vulnerability:** IDOR in `src/app/api/research/chat/update_name/[id]/route.ts`. The route allowed unauthenticated users to update any chat's name by ID.
**Learning:** API routes must explicitly filter by `userId` in Mongoose queries (e.g., `findOneAndUpdate({ _id: id, userId: ... })`) to prevent IDOR.
**Prevention:** Always authenticate users (`getAuthenticatedUser`) and enforce ownership in DB queries for user-specific resources.

## 2026-01-30 - IDOR in Research Queue Creation  
**Vulnerability:** IDOR in `src/app/api/research/research/create_research_queue/route.ts`. The route allowed any user to create research for any chat by ID without ownership verification.
**Learning:** Even streaming endpoints must verify resource ownership before processing. Use `findOne({ _id, userId })` instead of `findById`.
**Prevention:** Always authenticate users and verify ownership for all user-specific resources, including streaming/async endpoints.
