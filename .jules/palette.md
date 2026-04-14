## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Keyboard Focus on Visually Hidden Inputs
**Learning:** Visually hidden file inputs using `opacity-0` nested in a label often lose visual focus indication when navigated by keyboard.
**Action:** Change `opacity-0` to `sr-only`, add an `aria-label`, and use Tailwind's `has-[:focus-visible]:ring-2` on the wrapping `<label>` to highlight the parent when the child input is focused.
