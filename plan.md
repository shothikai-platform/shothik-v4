1. **Add `.lean()` to Mongoose query in `src/app/api/sheet/chat/get_my_chats/route.ts`**
   - Use `replace_with_git_merge_diff` to modify `src/app/api/sheet/chat/get_my_chats/route.ts` and add `.lean()` to the Mongoose query. Note that the frontend code `src/components/agents/ChatSidebar.jsx` uses `chat._id || chat.id` and specifically routes to `?id=${chat._id}`, so using `.lean()` which drops virtual `.id` is safe.
2. **Run tests and linting**
   - Execute `pnpm run lint` and `pnpm exec vitest run` via `run_in_bash_session` to ensure the change doesn't break anything.
3. **Complete pre-commit steps**
   - Run `pre_commit_instructions` and follow its instructions to ensure proper testing, verification, review, and reflection are done.
4. **Submit PR**
   - Call `submit` to create a PR for this performance optimization.
