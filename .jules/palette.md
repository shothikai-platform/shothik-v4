## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Accessible Custom File Upload Component
**Learning:** Building custom file upload areas by wrapping a hidden `<input type="file">` inside a `<div>` breaks keyboard accessibility, as the input loses focus management and the div isn't inherently focusable.
**Action:** Always wrap the file input inside a `<label htmlFor="unique-id">`, use React's `useId()` for the ID, change the input class to `sr-only` instead of `hidden`, and apply focus ring utilities (like `focus-within:ring-2`) to the `<label>` wrapper to make keyboard focus visible.
