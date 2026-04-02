## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-04-02 - Accessible Custom File Uploads
**Learning:** Using a simple `div` wrapper for custom file uploads breaks keyboard accessibility and native `<label>` interactions. Using `hidden` on the `<input type="file">` prevents focus visibility altogether.
**Action:** When creating custom file upload wrappers, replace the `div` with a semantic `<label>` using `useId()` to sync `htmlFor` and the input `id`. Add `sr-only` to the input instead of `hidden`, and use Tailwind's `has-[:focus-visible]:ring-2` pseudo-class variant on the label to visually surface keyboard focus from the invisible child input.