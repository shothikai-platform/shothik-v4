## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2024-05-24 - Accessible Icon-Only Buttons in Grammar Issue Cards
**Learning:** Found that the custom `GrammarIssueCard` component used icon-only buttons (`Check` and `Trash2`) for the primary interaction actions (Accept/Ignore) without accessible names. This made these critical actions completely opaque to screen reader users and confusing for visual users hovering over the icons.
**Action:** When creating inline actionable cards or list items, always ensure icon-only buttons include both `aria-label` for screen reader support and `title` for visual tooltips.
