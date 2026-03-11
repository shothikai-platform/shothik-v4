## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2026-03-11 - Keyboard Accessibility for Label-Wrapped File Inputs
**Learning:** When using a `<label>` to wrap and visually replace a hidden `<input type="file">`, keyboard users (using Tab) cannot naturally focus the label, and cannot press Enter/Space to trigger the file picker.
**Action:** Add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler (for Enter/Space) to the `<label>`, and `tabIndex={-1}` to the hidden input to fix the tab order and enable full keyboard interaction.
