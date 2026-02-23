## 2025-05-27 - Optimizing ResearchStreamingShell
**Learning:** `ResearchStreamingShell` was re-rendering `ResearchProcessLogs` on every tab switch because it passed a new array `researches={[]}` on every render. This broke `React.memo` optimization (even if `ResearchProcessLogs` was memoized).
**Action:** Always use stable constants (e.g., `const EMPTY_ARRAY = []`) or `useMemo` for empty array/object props passed to memoized children. Also, ensure children are actually wrapped in `React.memo` if they are expensive to render.
