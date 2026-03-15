## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2026-03-15 - Accessible File Upload Buttons
**Learning:** Implementing custom keyboard accessibility on a label wrapping a file input using `role="button"` and `tabIndex` breaks native ARIA rules and hides the native input.
**Action:** Let the native `<input type="file">` handle focus natively. Use Tailwind's `focus-within:ring-2 focus-within:ring-offset-2` on the wrapping `<label>` so the focus state is visible.
