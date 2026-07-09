## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-07-09 - Accessible Labels for Icon-Only Buttons
**Learning:** Found that icon-only buttons like Mic and Send in AgentPage lacked screen reader text, and adding both tooltips AND `aria-label` attributes is essential to fully satisfy a11y requirements.
**Action:** Ensure icon-only buttons are given an `aria-label` explicitly, even when wrapped in a Tooltip component.
