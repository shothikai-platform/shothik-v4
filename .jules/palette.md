## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-19 - Programmatic Association of Form Errors
**Learning:** React Hook Form inputs in this codebase often display error messages visually but lack programmatic association via `aria-describedby` and `aria-invalid`.
**Action:** When creating reusable form components, use `React.useId()` to generate a unique ID for the error/helper text and link it to the input using `aria-describedby`.
