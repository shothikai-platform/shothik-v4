## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-28 - Focus Indicators for Hidden File Inputs
**Learning:** Custom file upload buttons (using a visible `<label>` wrapping an invisible `<input type="file">`) are inaccessible for keyboard users if they lack focus styles on the label when the input receives focus.
**Action:** Add `focus-within:ring-2` (and optionally other `focus-within` styles) to the `<label>` so the focus outline correctly appears when the hidden input receives focus via Tab navigation.
