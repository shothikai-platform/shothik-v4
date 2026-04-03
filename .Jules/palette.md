## 2024-05-23 - ChatInput Loading State
**Learning:** Radix UI Slots can be tricky with loading states. Replacing children of a Button component is safer than managing Slot composition when adding a Spinner.
**Action:** When adding loading states to Shadcn/Radix buttons, prefer conditional rendering of children over `isLoading` props if custom composition is needed.

## 2024-05-23 - Vitest Environment Constraints
**Learning:** Vitest environment in this project lacks `jest-dom` matchers (like `toHaveAttribute`) and requires manual `cleanup` in `afterEach`.
**Action:** Use standard assertions (e.g. `expect(el.getAttribute('...')).toBe(...)`) and explicit cleanup in tests.
