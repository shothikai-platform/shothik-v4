## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Keyboard Access for Custom File Upload Buttons
**Learning:** Wrapping a hidden `<input type="file">` in a `<label>` provides good visual styling but breaks keyboard accessibility by default, as `<label>`s are not natively focusable or keyboard-clickable.
**Action:** Always add `role="button"`, `tabIndex={0}`, focus-visible styles, and an `onKeyDown` listener (for 'Enter' and 'Space') to the `<label>`, and apply `tabIndex={-1}` to the hidden `<input>` to maintain correct tab ordering and keyboard operability.
