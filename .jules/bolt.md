## 2025-05-15 - Chat Message Deduplication Optimization
**Learning:** Chat interfaces with long history (N) and frequent optimistic updates (M) suffer from O(N*M) complexity when deduplicating messages using nested loops. This causes UI freezing during typing or updates.
**Action:** Replace `some()` or nested searches with a `Set` of message signatures (e.g., content+role) to achieve O(N+M) complexity. Pre-calculate the Set from the stable history.
