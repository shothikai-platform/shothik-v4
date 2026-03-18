## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Keyboard Accessible File Upload Button
**Learning:** Custom file upload buttons built with `div` and `onClick` handlers are not keyboard accessible. Even if a `role="button"` and `tabIndex` were added, it requires extra JS to trigger the hidden file input. And `hidden` class makes it unfocusable.
**Action:** Use a `<label>` wrapping an `input type="file"` with `className="sr-only"`. The `<label>` naturally proxies clicks to the input, and the input itself is focusable via keyboard because it's only visually hidden (`sr-only`) rather than `display: none` (`hidden`). Use Tailwind's `focus-within` on the label (e.g., `focus-within:ring-2`) to show focus state when the inner input receives focus.
