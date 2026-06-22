## 2025-05-22 - [DoS Prevention via Input Validation]
**Vulnerability:** Resource exhaustion (Denial of Service) via unrestricted input text size and variant count in the NLP inference service.
**Learning:** ML inference services are particularly susceptible to DoS because processing large inputs or many variants consumes significant CPU and memory.
**Prevention:** Use Pydantic `Field` constraints to enforce strict length and range limits on all user-controlled inputs at the API gateway/routing layer.

## 2025-02-26 - [IDOR in Research Chat API]
**Vulnerability:** `get_one_chat` endpoint fetched chats by ID without verifying user ownership, allowing unauthorized access to other users' chats.
**Learning:** Checking authentication is not enough; authorization (ownership check) is mandatory for accessing user-specific resources.
**Prevention:** Always scope database queries with `userId` (e.g., `findOne({ _id: id, userId: currentUser._id })`) instead of just `findById(id)`.

## 2025-02-27 - [XSS via dangerouslySetInnerHTML in React component]
**Vulnerability:** The GrammarIssueCard component constructed an HTML string to highlight text and rendered it using \`dangerouslySetInnerHTML\`. This allowed arbitrary JavaScript execution if malicious payload was passed in \`sentence\` or \`correct\` props.
**Learning:** Manual HTML string manipulation combined with \`dangerouslySetInnerHTML\` is extremely risky and unnecessary in React. The correct approach is to parse/split strings and return arrays of React elements, which React automatically escapes.
**Prevention:** Avoid \`dangerouslySetInnerHTML\` when formatting text. Split text based on search terms and map matched parts to styled React components instead of manually concatenating HTML tags.
