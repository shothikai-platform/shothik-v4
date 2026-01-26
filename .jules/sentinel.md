## 2026-01-26 - IDOR Vulnerability in Research Chat
**Vulnerability:** `get_one_chat` endpoint allowed fetching any chat by ID without checking if the authenticated user owned it.
**Learning:** API routes that accept an ID in the URL (e.g. `[id]`) must always validate that the resource belongs to the current user. `findById(id)` is insufficient; `findOne({ _id: id, userId: ... })` is safer.
**Prevention:** Enforce a pattern where all user-specific resource queries include `userId` in the filter criteria. Review all dynamic routes for ownership checks.
