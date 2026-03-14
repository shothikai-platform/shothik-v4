## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2024-03-14 - Accessible Custom File Upload Buttons
**Learning:** Wrapping a hidden `<input type="file">` inside a styled `<label>` creates an inaccessible element for keyboard users unless explicit tab management and keyboard event handlers are added. The hidden input removes the native focusability.
**Action:** Always add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler (listening for 'Enter' or 'Space' to trigger a click on the hidden input ref) to the `<label>` wrapper, while ensuring the hidden input receives `tabIndex={-1}`.
