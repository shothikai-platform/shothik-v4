## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltip on Disabled Buttons
**Learning:** `pointer-events-none` on disabled buttons prevents Tooltips from triggering.
**Action:** Wrap disabled buttons in a `span` (serving as the TooltipTrigger) and ensure `pointer-events` are handled correctly. Use conditional `tabIndex` on the wrapper to allow keyboard focus only when disabled.
