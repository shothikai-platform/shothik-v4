## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Semantic Labels & File Inputs
**Learning:** Avoid wrapping file inputs in `div`s with JavaScript `onClick` handlers. When multiple instances render on a single page, a hardcoded `id` breaks accessibility and input linkage. Also, using `hidden` on an input makes it impossible to focus via keyboard.
**Action:** Always wrap file inputs in a semantic `<label>` using React `useId()` for a dynamic, isolated ID link. Use `className="sr-only"` instead of `hidden` on the input, and style the `<label>` using `focus-within:ring-2` to restore keyboard accessibility and visual focus indicators.
