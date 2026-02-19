## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Accessible Form Fields with RHF
**Learning:** `react-hook-form` wrappers often miss `aria-invalid` and `aria-describedby`. Using `React.useId()` ensures unique IDs for error messages, linking them programmatically to the input.
**Action:** Always add `aria-invalid={!!error}` and link helper/error text via `aria-describedby` in form components.
