## 2024-05-22 - Preventing List Re-renders
**Learning:** In list views where items are complex (like `SlidePreview`), interacting with one item (e.g., changing a tab) can trigger a re-render of ALL items if the parent's handler function isn't memoized.
**Action:** Always wrap event handlers passed to list items in `useCallback` and wrap the list item component in `React.memo`. This is critical for performance when the list item component is heavy (has iframes, hooks, or complex DOM).
