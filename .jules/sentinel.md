## 2025-02-20 - IDOR in Research Chat API
**Vulnerability:** Unprotected API endpoints (`get_one_chat`, `delete_chat`, `update_name`) allowed any user to access, modify, or delete any other user's research chats by guessing the ID.
**Learning:** Developers correctly implemented auth on list/create endpoints but forgot to replicate those checks on item-specific endpoints (`[id]`). This is a common pattern where "ownership" checks are missed when fetching by ID.
**Prevention:** Always scope DB queries by `userId` when fetching user-specific resources. Use a middleware or helper function that enforces ownership checks for all `[id]` routes.
