## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2024-03-12 - Replace onClick div with button for immediate a11y
**Learning:** A common pattern in this app is using `div` with `onClick` for interactive elements (like agent selection). This makes them inaccessible to keyboard users because they lack default focus management and "Enter/Space" key activation.
**Action:** Always refactor clickable `div` or `span` elements to native `<button type="button">` elements. This provides immediate keyboard support, and adding standard `focus-visible` Tailwind classes provides a crucial visual indicator for keyboard navigation.
