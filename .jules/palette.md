## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-19 - Tooltips on Disabled Buttons
**Learning:** Radix UI Tooltips do not trigger on disabled buttons because they ignore pointer events.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` (focusable) and `className="outline-none focus-visible:ring-..."` to ensure the tooltip is accessible via hover and keyboard.
