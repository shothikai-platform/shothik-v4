## 2025-05-23 - ResearchProcessLogs Optimization
**Learning:** The `ResearchProcessLogs` component was re-rendering the entire timeline list (O(N)) every time a new log event arrived via SSE, because the `steps` array was being rebuilt with new object references. This causes massive layout thrashing during long research sessions.
**Action:** Implemented `React.memo` with a custom `arePropsEqual` comparator on `ProcessTimelineItem` to ensure only the new and last item re-render. Passed stable data references by checking `ev.data` referential equality.
