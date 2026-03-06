## 2024-03-06 - Accessible Toolbar Buttons
**Learning:** Icon-only toolbar buttons must include both `aria-label` for screen reader support and `title` for visual tooltips on hover. `EditorToolbar` in the grammar checker was using `title` but missing `aria-label`.
**Action:** When adding or reviewing icon-only buttons, always ensure `aria-label` (or `aria-labelledby`) is present alongside `title` or tooltip components.

## 2024-03-06 - Accessible Toolbar Buttons
**Learning:** Icon-only toolbar buttons must include both `aria-label` for screen reader support and `title` for visual tooltips on hover. `EditorToolbar` in the grammar checker was using `title` but missing `aria-label`.
**Action:** When adding or reviewing icon-only buttons, always ensure `aria-label` (or `aria-labelledby`) is present alongside `title` or tooltip components.
