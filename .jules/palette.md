## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2025-02-18 - File Input sr-only vs hidden
**Learning:** When a file input is programmatically triggered by a separate, fully accessible `<button>` (like "Attach files"), using `sr-only` creates a confusing invisible tab stop and duplicates the screen reader control.
**Action:** Use `hidden` (or `display: none`) for `<input type="file">` if it is triggered by an adjacent accessible custom button. Use `sr-only` only when the input itself is the primary accessible control.
