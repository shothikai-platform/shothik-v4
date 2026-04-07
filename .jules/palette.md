## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2025-02-18 - ARIA labels on visually hidden file inputs\n**Learning:** Visually hidden file inputs (e.g., `<input type="file" className="opacity-0" />`) used in custom file upload components must include a descriptive `aria-label` attribute to ensure proper screen reader announcement.\n**Action:** Always add `aria-label` to visually hidden file inputs.
