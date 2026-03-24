## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-14 - Custom File Upload Focus States
**Learning:** When using a `<label>` to wrap a hidden `<input type="file">` for a custom file upload button, using the `hidden` class makes the input focus-invisible and inaccessible to keyboards.
**Action:** Use the `sr-only` class on the input instead to ensure it remains keyboard focusable. Let the native input manage focus, and apply `focus-within` styling (like `focus-within:ring-2 focus-within:ring-ring focus-within:outline-none`) to the label wrapper to make keyboard focus visible.
