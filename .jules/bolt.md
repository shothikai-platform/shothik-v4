## 2024-05-23 - High-Frequency Redux Updates in Streaming
**Learning:** Streaming text/events directly into Redux via individual dispatches (e.g., inside a `while` loop reading from a stream) causes massive re-render storms. Even with `React.memo`, the frequency of state updates (50+ per second) chokes the main thread.
**Action:** Always buffer/batch stream events before dispatching to Redux. Use a local accumulator in the stream loop and dispatch chunks (e.g., every network chunk or throttled time window).
