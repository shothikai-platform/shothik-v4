## 2024-05-24 - API Authorization Bypasses (IDOR)
**Vulnerability:** User-facing endpoints like `delete_chat` and `update_name` perform operations without checking if the authenticated user owns the resource, leading to Insecure Direct Object Reference (IDOR).
**Learning:** `findByIdAndUpdate` and `findByIdAndDelete` inherently lack authorization checks.
**Prevention:** Always authenticate via `getAuthenticatedUser()` and use `findOneAndUpdate` / `findOneAndDelete` with `{ _id: id, userId: user._id || user.id }`.
