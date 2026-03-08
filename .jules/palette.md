## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2024-03-24 - Accessibility: ARIA Labels for Icon-Only Toolbar Buttons
**Learning:** Found multiple instances of icon-only buttons in the editor toolbars that relied only on `title` attributes. While `title` provides visual tooltips, explicit `aria-label` attributes are more robust and necessary for ensuring accessibility with screen readers.
**Action:** Always include explicitly defined `aria-label` attributes on icon-only action buttons (e.g., Bold, Italic, Undo) to ensure full screen reader support, even if a `title` attribute is present.
