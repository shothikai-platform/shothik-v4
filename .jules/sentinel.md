## 2024-02-18 - IDOR in Research Chat Retrieval
**Vulnerability:** The `get_one_chat` API endpoint retrieved chat sessions using `findById(id)` without verifying that the authenticated user owned the document. This allowed any user to access any research chat by guessing or enumerating IDs (Insecure Direct Object Reference).
**Learning:** Reliance on obscure IDs is not a security control. Authentication checks must be followed by authorization checks (ownership). Mongoose's `findById` is convenient but dangerous for user-scoped data.
**Prevention:** For user-specific resources, replace `findById(id)` with `findOne({ _id: id, userId: currentUser._id })` to enforce ownership at the database query level. Ensure tests explicitly cover negative cases (accessing another user's resource).
