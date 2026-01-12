## 2024-05-23 - Chat Log Lookup Optimization
**Learning:** In React render loops, avoid O(N*M) operations like `findIndex` inside `map`. For correlated data lists (like logs vs messages), pre-computing a lookup Map reduces complexity to O(N).
**Action:** Use `useMemo` to build a Map keying unique identifiers (like timestamp) to indices or objects, then perform O(1) lookups in the render loop. Ensure to handle duplicate keys if necessary (e.g., keeping first occurrence).
