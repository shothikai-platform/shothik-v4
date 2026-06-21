1.  **Analyze current code**: The `GET` function in `src/app/api/sheet/chat/get_my_chats/route.ts` fetches sheet sessions via Mongoose using `SheetSession.find({}).sort({ updatedAt: -1 })`. Mongoose queries return Mongoose Document instances which consume more memory and processing time than plain JavaScript objects.
2.  **Apply `.lean()` optimization**: Modify the `SheetSession.find({}).sort({ updatedAt: -1 })` query to append `.lean()`. This instructs Mongoose to return plain JS objects, reducing overhead.
3.  **Include optimization comment**: As instructed by the Bolt guidelines, add the comment `// Optimization: Return plain JS objects instead of Mongoose documents` alongside the `.lean()` call.
4.  **Run tests and linter**: Execute `pnpm run lint` and `pnpm exec vitest run` in separate bash sessions to ensure the change introduces no regressions.
5.  **Submit Pull Request**: Create a PR titled `⚡ Bolt: [performance improvement]` with the following structure:
    *   💡 What: Added `.lean()` to the `SheetSession.find()` query in the sheet chat history route.
    *   🎯 Why: Mongoose documents are heavy. Returning plain JS objects reduces memory consumption and speeds up processing time on the server.
    *   📊 Impact: Reduces response parsing overhead and memory usage for session history fetching.
    *   🔬 Measurement: Check server CPU/Memory usage during multiple `/api/sheet/chat/get_my_chats` endpoint requests.
