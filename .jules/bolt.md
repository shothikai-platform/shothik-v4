# Bolt's Journal ⚡

## 2025-02-20 - Streaming Message Re-render Storm
**Learning:** Passing a constantly changing array (like `processedLogs` which grows on every token/chunk) to memoized list items causes O(N) re-renders for the entire list, even if individual items don't need the array.
**Action:** Extract the specific boolean condition (`isRecent`) needed by the child component and pass that instead of the entire array. This allows `React.memo` to work effectively as the boolean is stable for most items.
