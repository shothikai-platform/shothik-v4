## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2024-03-01 - UploadAvatar Accessibility & Keyboard Support
**Learning:** Hardcoding `id`s on `<input type="file">` and using a `div` as a custom upload button wrapper breaks when multiple inputs render on the same page. Hiding the input with `className="hidden"` completely removes keyboard focusability and screen reader visibility.
**Action:** Use React's `useId()` to generate dynamic IDs. Change the wrapper to `<label htmlFor={inputId}>` to natively bind clicks. Change the input's class to `sr-only` to keep it focusable, and style the `<label>` with `focus-within:outline-none focus-within:ring-2 focus-within:ring-ring` so keyboard users get native focus styling.
