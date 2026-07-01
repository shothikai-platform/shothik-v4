1. **Optimize `SheetSession.find({})` in `src/app/api/sheet/chat/get_my_chats/route.ts`**
   - The `SheetSession.find({})` call currently fetches Mongoose documents, which is slower than returning plain JavaScript objects.
   - We will append `.lean()` to the query to convert the documents to plain JS objects, reducing memory overhead and improving performance.
   - We will also add the required comment explaining the optimization.

2. **Execute tests**
   - Use `run_in_bash_session` to run tests and verify nothing is broken (`pnpm exec vitest run`).

3. **Execute lint**
   - Use `run_in_bash_session` to run linter (`pnpm lint`).

4. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**

5. **Submit PR**
   - Title: `⚡ Bolt: [performance improvement] Use .lean() in get_my_chats for SheetSession`
   - Description:
     💡 What: Added `.lean()` to the `SheetSession.find({})` query in the `get_my_chats` endpoint.
     🎯 Why: Returning plain JS objects instead of full Mongoose documents reduces memory overhead and serialization time.
     📊 Impact: Reduces memory usage and improves response time for fetching sheet sessions.
     🔬 Measurement: Check memory profiling or response time metrics before and after the change on this endpoint.
