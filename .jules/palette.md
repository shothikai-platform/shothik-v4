## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2024-03-04 - ARIA Labels for Icon-Only Toolbar Buttons
**Learning:** Toolbars often rely on visual cues (icons with tooltips) for actions like Bold, Italic, and Lists. However, icon-only buttons without `aria-label`s are completely invisible to screen readers, causing significant accessibility barriers in text editors.
**Action:** Always pair `title` (for sighted users) with an identical or descriptive `aria-label` (for screen readers) on icon-only buttons in toolbars.
