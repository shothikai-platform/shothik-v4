## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-19 - Accessible Custom File Uploads
**Learning:** Nesting a visually hidden `<input type="file">` inside a `<Button>` component renders invalid HTML (`<input>` inside `<button>`), breaking native accessibility and click propagation on some screen readers and browsers.
**Action:** Use a `<label>` element styled visually as a button (using `buttonVariants`), mark the inner input with `.sr-only` (not just `opacity-0` or `hidden`) along with an `aria-label`, and use Tailwind's `has-[:focus-visible]:ring-2` on the label wrapper to correctly show keyboard focus states.