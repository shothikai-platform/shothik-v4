## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2024-03-13 - File Upload Button Keyboard Accessibility
**Learning:** When using a `<label>` to wrap and style a hidden `<input type="file">` as a custom button, the element lacks proper keyboard accessibility (tab navigation and Enter/Space triggers) because the input is visually hidden and labels don't natively receive focus or keyboard events.
**Action:** Always add `role="button"`, `tabIndex={isProcessing ? -1 : 0}`, and an `onKeyDown` handler (listening for 'Enter' and 'Space' to trigger the input's click) to the label, while adding `tabIndex={-1}` to the hidden input to ensure full keyboard accessibility.
