## 2025-02-28 - IDOR in Research Chat
**Vulnerability:** IDOR (Insecure Direct Object Reference) in `get_one_chat` (and likely others) allowed any user to read any chat by ID.
**Learning:** API routes accessing user-specific resources were implemented using `findById(id)` without validating ownership against the authenticated user.
**Prevention:** Always use `findOne({ _id: id, userId: user.id })` for user-specific resources, or explicitly check `resource.userId === user.id` after fetching.
