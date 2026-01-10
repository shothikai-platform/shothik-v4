## 2024-05-22 - IDOR in Research Chat Retrieval
**Vulnerability:** The `get_one_chat` endpoint allowed retrieving any chat by ID without checking if the authenticated user owned the chat or was authenticated at all.
**Learning:** This vulnerability existed because the endpoint relied solely on `findById(id)` without incorporating the `userId` from the session into the database query, assuming finding the ID was sufficient.
**Prevention:** All user-specific resource endpoints must:
1. Validate authentication (`getAuthenticatedUser`).
2. Include ownership checks in the database query (e.g., `findOne({ _id: id, userId: user._id })`) rather than checking ownership after fetching or not checking at all.
