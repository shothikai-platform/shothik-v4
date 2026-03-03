## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Tooltips and ARIA on Formatting Editor Toolbars
**Learning:** Icon-only buttons inside editor toolbars (like TipTap) need both `aria-label` for screen reader support and `title` for visual tooltips to provide clarity without requiring complex Tooltip component wrappers.
**Action:** Always include both `aria-label` and `title` attributes with the same descriptive text on bare icon-only `<button>` elements.
