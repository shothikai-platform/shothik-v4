1. **Optimize Mongoose read queries with `.lean()`**:
   - Add `.lean()` to the read query in `src/app/api/sheet/chat/get_my_chats/route.ts` to return plain JavaScript objects and improve API response speed.
   - Add `.lean()` to the read query in `src/app/api/research/chat/get_one_chat/[id]/route.ts`.
2. **Update tests**:
   - Update tests for `get_one_chat` and `get_my_chats` to properly mock `.lean()`.
3. **Pre-commit checks**:
   - Ensure `pnpm run lint` and `pnpm test` pass.
