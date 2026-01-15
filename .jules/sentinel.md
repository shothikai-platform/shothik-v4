# Sentinel's Journal

## 2025-02-18 - IDOR in Research Chat API
**Vulnerability:** The API endpoint `GET /api/research/chat/get_one_chat/[id]` allowed retrieving chat details solely by ID, without verifying that the authenticated user owned the chat.
**Learning:** Middleware protection on routes only verifies the user is logged in, but does not inherently enforce resource ownership. Direct database queries in API routes must explicitly include ownership checks (e.g., matching `userId`).
**Prevention:** Always use `getAuthenticatedUser()` in API routes and validate that the resource's `userId` matches the authenticated user's ID before returning data. Prefer queries like `findOne({ _id: id, userId: user._id })` over `findById(id)` followed by a check, though the latter is also acceptable if ownership is explicitly validated.
