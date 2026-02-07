# Palette's Journal

This journal documents critical accessibility and UX learnings specific to this project.
Refer to `AGENTS.md` (or the prompt instructions) for guidelines on what to include.

## 2024-05-22 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons often lack accessible names and visual feedback for loading states, making them confusing for screen readers and users on slow connections.
**Action:** Always add `aria-label` to icon-only buttons and implement a `Spinner` for async actions, disabling the button during the process.
