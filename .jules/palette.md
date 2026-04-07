## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Focus Visibility on Label-Wrapped Inputs
**Learning:** When using Tailwind CSS to apply focus visibility styles to a `<label>` wrapping a visually hidden input (like `<input type="file" className="opacity-0" />`), the wrapper won't show focus unless explicitly styled with the `:has` pseudo-class for its focused children.
**Action:** Use the `has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:border-ring outline-none` classes on the wrapping `<label>` to ensure the focus state is properly reflected when the inner input receives keyboard focus.
