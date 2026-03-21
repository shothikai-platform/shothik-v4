## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2023-10-27 - Language Menus Keyboard Accessibility
**Learning:** In highly interactive components with multiple items like language grids, `<div>` tags with `onClick` handlers often lack semantic meaning and keyboard support. While a click works, screen readers ignore them and keyboard users cannot tab to them.
**Action:** When creating grid or list selection items (e.g., `<RenderLanguages>`), always refactor clickable `<div>` elements into `<button type="button">`. Ensure standard focus rings (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`) are applied to indicate focus explicitly.
