# Sentinel's Journal

## 2025-02-18 - IDOR in Research Chat API
**Vulnerability:** Found Insecure Direct Object Reference (IDOR) in `get_one_chat` and `delete_chat` endpoints. These routes accepted a chat ID and returned or deleted the chat without verifying if the authenticated user owned the chat.
**Learning:** API routes in Next.js do not inherit authentication or authorization by default. Developers must explicitly add checks. The codebase defaults to insecure "find by ID" patterns which are risky.
**Prevention:** Always use the "find by ID AND User" pattern: `Model.findOne({ _id: id, userId: user.id })`. This enforces ownership at the database level and prevents data leakage even if the application logic fails elsewhere.
