1. **Add `.lean()` to `SheetSession.find({})` query in `src/app/api/sheet/chat/get_my_chats/route.ts`**
   - The route `src/app/api/sheet/chat/get_my_chats/route.ts` currently fetches multiple `SheetSession` documents using Mongoose `find({})` but does not use `.lean()`.
   - By appending `.lean()`, Mongoose will return plain JavaScript objects instead of Mongoose documents, reducing the memory footprint and improving execution time.
   - We will use `replace_with_git_merge_diff` to add `.lean()` and the required performance comment.

2. **Verify changes via tests**
   - I will run `pnpm exec vitest run` to ensure no tests are broken by this change.

3. **Verify changes via linter**
   - I will run `pnpm run lint` to ensure no linting errors are introduced.

4. **Complete pre-commit steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

5. **Submit a PR**
   - Create a PR with the title `⚡ Bolt: Use .lean() in SheetSession.find()`
   - Description format:
     * 💡 What: Added `.lean()` to `SheetSession.find({}).sort({ updatedAt: -1 })` in `src/app/api/sheet/chat/get_my_chats/route.ts`.
     * 🎯 Why: This returns plain JavaScript objects instead of heavy Mongoose document instances, improving backend query performance and reducing memory overhead.
     * 📊 Impact: Improves execution time and decreases memory usage for API requests fetching sheet sessions.
     * 🔬 Measurement: Observe memory usage and latency for the `/api/sheet/chat/get_my_chats` endpoint under load.
