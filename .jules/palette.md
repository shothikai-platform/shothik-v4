## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-03-16 - Agent Selection Cards and Icon Buttons Accessibility
**Learning:** Agent selection UI built with `<div>` and `onClick` completely breaks keyboard navigation for screen reader users. Additionally, icon-only buttons (like Back or Attach) frequently lack `aria-label`s, rendering them invisible or confusing to assistive tech.
**Action:** Always refactor clickable `<div>` elements to `<button type="button">` with `focus-visible` styling (like `focus-visible:ring-2 focus-visible:ring-primary`). Always add descriptive `aria-label` attributes to icon-only buttons. Wrap critical action buttons (like Send) in Tooltips for visual clarity, especially when disabling them.
