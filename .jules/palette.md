## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-04-01 - Accessible Custom File Uploads
**Learning:** Using `div` with `onClick` mapping to a `hidden` input is inaccessible to keyboard navigation and screen readers.
**Action:** When creating custom file uploads, always wrap the `<input type="file">` in a `<label>`. Assign a unique ID using `useId()` to the input and `htmlFor` on the label. Make the input visually hidden (`sr-only`) rather than `hidden`, and style the `<label>` using `focus-within:ring-2` to provide native focus indication.
