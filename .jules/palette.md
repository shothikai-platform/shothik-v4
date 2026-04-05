## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Keyboard Accessible Custom File Uploads
**Learning:** Custom file uploads that use a `div` and `onClick={() => document.getElementById('input').click()}` are fundamentally inaccessible to keyboard users and break if the hardcoded ID appears multiple times.
**Action:** Always use a `<label>` as the container for custom file uploads, nest the `<input type="file">` inside it, and change the input to `sr-only` so it remains natively focusable. Use Tailwind's `has-[:focus-visible]:ring` on the parent label to provide visible focus rings when the hidden input is focused via keyboard.
