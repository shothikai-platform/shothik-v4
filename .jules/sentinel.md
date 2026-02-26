## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-26 - [Mocking NextResponse in Vitest]
**Vulnerability:** N/A (Testing challenge)
**Learning:** When an API route uses both `NextResponse.json()` and `new NextResponse(stream)`, mocking `NextResponse` requires a hybrid approach. A simple `vi.fn()` or object mock will fail either the constructor call or the static method call.
**Prevention:** Use a function as the mock and manually attach the static `json` method to it. This ensures it can be used both as a constructor and as a utility class.
