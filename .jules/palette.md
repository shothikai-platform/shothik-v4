## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Missing ARIA on Form Components
**Learning:** `RHFTextField` and `RHFSelect` lacked `aria-invalid` and `aria-describedby` linkage to helper/error text, making errors inaccessible. React's `useId` solves this cleanly.
**Action:** Always link form inputs to their helper text using `useId` and `aria-describedby` to ensure assistive technologies announce errors correctly.
