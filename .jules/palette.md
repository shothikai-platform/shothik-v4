## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2024-03-10 - File Upload Label Keyboard Accessibility
**Learning:** Wrapping a hidden `<input type="file">` inside a styled `<label>` creates a custom upload button but completely breaks native keyboard accessibility because labels do not receive focus or trigger on Enter/Space.
**Action:** When creating custom upload buttons using `<label>`, always add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler (listening for 'Enter' and 'Space' to trigger the inner input's click). Additionally, add `tabIndex={-1}` to the hidden input to prevent redundant focus steps.
