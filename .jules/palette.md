## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2026-07-06 - [Icon-Only Button Tooltips & Accessibility]
**Learning:** Adding Tooltips to disabled elements requires a wrapper element like `<span>` because standard HTML behavior prevents disabled elements from firing pointer events (e.g. `mouseenter`) required to trigger tooltips. While Radix UI tooltips provide some a11y via `aria-describedby`, explicit `aria-label` attributes on icon-only buttons remain the most robust practice for screen readers.
**Action:** Always wrap buttons with a potential `disabled` state in a `<span tabIndex={0}>` when applying Tooltips, and never omit explicit `aria-label`s on icon-only buttons, even when a Tooltip is present.
