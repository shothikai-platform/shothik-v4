## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-05-23 - [Widespread IDOR and Field Inconsistency in Research Chat]
**Vulnerability:** Insecure Direct Object Reference (IDOR) across CRUD operations (`delete_chat`, `update_name`) and field mapping mismatch (`title` vs `name`).
**Learning:** Vulnerabilities often cluster in feature modules. Fixing one endpoint (like `get_one_chat`) without auditing siblings leaves the application exposed. Field mapping inconsistencies can bypass intended logic or cause silent failures.
**Prevention:** Perform a full CRUD audit whenever an IDOR is found. Use consistent naming between schema, API payload, and internal variables to reduce implementation errors.
