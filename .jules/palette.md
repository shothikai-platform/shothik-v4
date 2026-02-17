## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2026-02-17 - Form Validation Accessibility
**Learning:** `RHFTextField` (and likely other form wrappers) rendered error messages visually but failed to link them programmatically via `aria-describedby` or mark the input as `aria-invalid`.
**Action:** When wrapping form inputs, always use `React.useId()` to generate stable IDs for helper/error text and explicitly link them to the input.
