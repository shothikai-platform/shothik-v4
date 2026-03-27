## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-28 - ARIA Labels on UI Controls
**Learning:** Common UI controls like expanding task progress items or closing alert dialogs often rely solely on visual icons without an `aria-label` or `aria-expanded` state, making them difficult to operate via screen reader.
**Action:** When working on components that use interactive icons like `X`, `ChevronDown`, or `ChevronUp`, always ensure the `<button>` element specifies an explicit `aria-label`. For expanding/collapsing elements, pair it with `aria-expanded`.