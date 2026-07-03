## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Tooltip & ARIA on Icon-Only Back Buttons
**Learning:** Icon-only "Back" buttons in headers and input areas are completely opaque to screen readers without an `aria-label`. They also suffer from poor discoverability without tooltips, especially when the icon (`ArrowLeft`) could mean "previous page", "undo", or "unselect".
**Action:** When adding or updating icon-only navigation/action buttons, always wrap them in a standard `@/components/ui/tooltip` block and provide an explicit `aria-label` describing the destination/action (e.g., "Back to Campaign").
