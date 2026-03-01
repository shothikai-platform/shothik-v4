## 2025-03-01 - Prevent IDOR in SheetSession get_my_chats
**Vulnerability:** The `get_my_chats` endpoint in `src/app/api/sheet/chat/get_my_chats/route.ts` suffered from a severe Broken Access Control (IDOR) data leak, exposing all sheet sessions across the entire database to any unauthenticated user via a simple `SheetSession.find({})` call.
**Learning:** Endpoints returning collections of user data frequently lack basic ownership boundary checks when developers omit the `userId` filter condition. Mongoose `find({})` is often a strong indicator of this.
**Prevention:** Every API handler fetching records MUST verify user identity using `getAuthenticatedUser()` and securely apply that ID to the query parameters (e.g., `find({ userId: user._id })`) to strictly bound data access.
