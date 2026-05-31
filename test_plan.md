1. **Apply `.lean()` optimization to `SheetSession.find({})` in `src/app/api/sheet/chat/get_my_chats/route.ts`**
   - I will modify `src/app/api/sheet/chat/get_my_chats/route.ts` to add `.lean()` to the `SheetSession.find({})` query.
2. **Update journal `bolt.md`**
   - N/A (this is a routine performance fix, `.lean()` for Mongoose queries has been covered).
3. **Run `pnpm lint` and `pnpm test`**
   - I will run `pnpm run lint` and `pnpm test` (or `pnpm exec vitest run`) to verify there are no errors.
4. **Complete pre-commit steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
5. **Submit the PR**
   - I will submit the PR with the title `⚡ Bolt: [performance improvement]` and the required formatting.
