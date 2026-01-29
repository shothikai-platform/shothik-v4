## 2026-01-29 - IDOR in Chat Update
**Vulnerability:** IDOR in `src/app/api/research/chat/update_name/[id]/route.ts`. The route allowed unauthenticated users to update any chat's name by ID.
**Learning:** API routes must explicitly filter by `userId` in Mongoose queries (e.g., `findOneAndUpdate({ _id: id, userId: ... })`) to prevent IDOR.
**Prevention:** Always authenticate users (`getAuthenticatedUser`) and enforce ownership in DB queries for user-specific resources.
