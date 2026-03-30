## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2024-03-30 - Add Explicit ARIA Labels to Dropdown Popover Buttons
**Learning:** Buttons inside dropdowns (like AccountPopover) that contain mixed elements (icons + multiline text) or have implicit actions might not announce their primary purpose clearly to screen readers due to their visual layout versus DOM structure.
**Action:** When rendering dropdown items as generic buttons, add explicit `aria-label` attributes (e.g., "View my profile", "Login or Sign up", "Log out") that convey the exact action performed, independently of the children rendered within the button.
