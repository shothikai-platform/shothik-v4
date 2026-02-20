## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Linking Form Errors to Inputs
**Learning:** `RHFTextField` and other form components were not linking error messages to inputs, making them inaccessible to screen readers.
**Action:** Always use `aria-describedby` on the input pointing to the error message ID, and `aria-invalid` on the input. Ensure the error message has a deterministic ID (e.g., `${name}-description`).
