## 2025-02-20 - Vitest Environment Setup
**Learning:** Vitest requires `vitest.config.ts` with explicit alias resolution (e.g., `@` -> `./src`) when running in a Next.js environment without existing Vite config, even if `tsconfig.json` paths are defined.
**Action:** Always verify `vitest.config.ts` exists or provide a temporary config when running verification tests in this repo.

## 2025-02-20 - Git Lock Issues
**Learning:** `pnpm install` or other operations might leave `.git/index.lock` if interrupted or if the environment is unstable, preventing subsequent git operations.
**Action:** Check for and remove `.git/index.lock` if git commands fail with "File exists".
