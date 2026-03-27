## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-01-22 - Redux Slice Selectors
**Learning:** Selecting entire Redux slices (e.g., `useSelector(state => state.slice)`) triggers re-renders on ANY change within that slice, which is catastrophic for list items relying on a single field.
**Action:** Always select minimal primitive values or use memoized selectors (reselect) in list components.

## 2026-01-22 - Markdown Performance
**Learning:** `marked()` parsing inside a component's render body runs on every re-render (e.g. hover interactions), causing UI jank.
**Action:** Always wrap expensive text processing (Markdown, Regex) in `useMemo`, especially in interactive components.
