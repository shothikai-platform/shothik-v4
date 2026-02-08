## 2025-05-23 - [Optimized Research List Rendering]
**Learning:** Extracting complex list items into memoized components significantly reduces re-renders when parent state (like streaming status or layout) changes, especially when inline event handlers are used in the map loop.
**Action:** Identify `map` loops in React components that define inline arrow functions for handlers. Extract the list item into a separate `React.memo` component and use `useCallback` or pass stable dispatch functions to prevent unnecessary re-renders of the entire list.
