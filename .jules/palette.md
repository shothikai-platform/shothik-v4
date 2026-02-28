## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Missing ARIA Labels on Title-Only Toolbar Buttons
**Learning:** Developers often rely solely on the `title` attribute for icon-only toolbar buttons (like rich text editors or action bars) to provide visual tooltips, but forget to add `aria-label` which is critical for consistent screen reader accessibility across different browsers/assistive technologies.
**Action:** When adding or reviewing icon-only buttons with `title` attributes, ensure an equivalent `aria-label` is also explicitly defined.
