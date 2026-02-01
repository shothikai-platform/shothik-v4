## 2024-05-22 - Hardcoded "temp-user" in Production Route
**Vulnerability:** The `create_conversation` route for Sheet Sessions was hardcoded to use `userId: 'temp-user'`, bypassing authentication entirely. It also lacked ownership checks when appending to existing chats (IDOR).
**Learning:** This was likely a leftover from initial prototyping that was never updated to use the real authentication system.
**Prevention:** Always use the authenticated user from the context (e.g., `getAuthenticatedUser`) instead of placeholders. Enforce strict ownership checks (`findOne({ _id: id, userId: user._id })`) for all resource access.
