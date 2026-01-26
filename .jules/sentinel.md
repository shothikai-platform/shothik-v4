## 2025-05-23 - IDOR Pattern in API Routes
**Vulnerability:** Found Insecure Direct Object Reference (IDOR) vulnerabilities in `get_one_chat` and `delete_chat` endpoints where resources were accessed by ID without verifying user ownership.
**Learning:** API routes accessing user-specific resources were implemented with simple `findById(id)` calls, assuming the ID knowledge was sufficient or missing the ownership check entirely.
**Prevention:** Always use `getAuthenticatedUser()` to retrieve the current user and filter database queries with `{ _id: id, userId: user._id }` to ensure the resource belongs to the requester.
