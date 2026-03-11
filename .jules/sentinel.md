## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2024-03-24 - IDOR Vulnerability in Research API Endpoints
**Vulnerability:** Insecure Direct Object Reference (IDOR) where API endpoints (`delete_chat`, `update_name`, `create_research_queue`) allowed any authenticated user to modify or delete a Research Chat by providing its ID, due to using `findByIdAndDelete` / `findByIdAndUpdate` without checking if the chat belonged to the user making the request.
**Learning:** Developers often forget that simply taking an ID from the request URL/body and using it to fetch or modify database records skips the authorization layer entirely, trusting the client-provided ID blindly.
**Prevention:** Always verify ownership of the resource before modifying or returning it. Use queries that include the authenticated user's ID as a filter, e.g., prefer `findOneAndDelete({ _id: id, userId: user._id })` over `findByIdAndDelete(id)` and `findOneAndUpdate({ _id: id, userId: user._id })` over `findByIdAndUpdate(id, ...)`.
