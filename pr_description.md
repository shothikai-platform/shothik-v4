🚨 **Severity:** CRITICAL
💡 **Vulnerability:** Insecure Direct Object Reference (IDOR) and missing authentication in `/api/research/chat/delete_chat/[id]` and `/api/research/chat/update_name/[id]` routes.
🎯 **Impact:** Unauthenticated or unauthorized users could delete or modify the name of any research chat by merely guessing or enumerating its ID, potentially leading to widespread data loss or tampering.
🔧 **Fix:** Imported `getAuthenticatedUser()` to enforce authentication. Replaced `findByIdAndDelete` and `findByIdAndUpdate` with `findOneAndDelete` and `findOneAndUpdate`, strictly scoped to the authenticated user's ID (`userId: user._id || user.id`).
✅ **Verification:** Ran `vitest run` on the modified endpoints' adjacent test files to ensure compatibility. Reviewed code manually to confirm the `userId` scoping is effectively preventing unauthorized access.
