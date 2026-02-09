## 2024-05-24 - Interactive Elements Semantics
**Learning:** Found `motion.div` used for clickable elements in image grids, which makes them inaccessible to keyboard users and screen readers.
**Action:** Use `motion.button` (or `button`) for any element that has an `onClick` handler, and ensure it has an accessible name (via content or `aria-label`). Use `type="button"` to prevent form submission.
