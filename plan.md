1. **Analyze:** Inspect `src/app/api/sheet/chat/get_my_chats/route.ts` and `src/app/api/research/chat/get_one_chat/[id]/route.ts`. Both endpoints fetch data from MongoDB using Mongoose but do not append `.lean()` to return plain JS objects instead of heavy Mongoose documents.
2. **Optimize `src/app/api/sheet/chat/get_my_chats/route.ts`:**
    - Append `.lean()` to the `SheetSession.find({}).sort({ updatedAt: -1 })` chain.
    - Since this endpoint currently returns all sessions, `.lean()` will significantly reduce memory overhead for serialization.
3. **Optimize `src/app/api/research/chat/get_one_chat/[id]/route.ts`:**
    - Append `.lean()` to the `ResearchChat.findOne({ ... })` query to return a plain object.
    - This skips hydrating the result into a full Mongoose model, making the GET request faster and more memory efficient.
4. **Testing:**
    - Run the existing test `src/app/api/research/chat/get_one_chat/[id]/route.test.ts` to make sure we didn't break anything. Wait, we need to mock `.lean()` in the test.
    - I should check if there's any test for `src/app/api/sheet/chat/get_my_chats/route.ts`. If not, create a simple test to make sure it runs successfully, or just run the app build/lint.
5. **Pre-commit checks & PR:**
    - Run `pnpm lint` and `pnpm test`.
    - Document in `.jules/bolt.md`.
    - Create PR with required structure.
