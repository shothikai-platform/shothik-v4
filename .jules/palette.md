## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Semantic Label for Custom File Uploads
**Learning:** Custom file upload buttons that use `<div onClick={() => document.getElementById('input').click()}>` with a `hidden` input are entirely inaccessible to screen readers and keyboard users.
**Action:** Use a `<label htmlFor={inputId}>` paired with an input that has the `sr-only` class. Use React's `useId()` to guarantee `htmlFor` uniqueness if the component is used multiple times. Apply `focus-within:ring-2 focus-within:ring-ring` classes to the label to make the native focus event visible.
