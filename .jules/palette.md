## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2026-03-16 - Upload Avatar Accessibility
**Learning:** The `UploadAvatar` component relied on a hidden `<input type="file">`, managed entirely via a non-semantic `<div>` with an `onClick` handler, completely omitting screen reader access and keyboard navigation support.
**Action:** Refactored the wrapper to a semantic `<label>` using `htmlFor`, changed the input's hidden styling from `display: none` to `.sr-only` to preserve screen reader availability, added an `aria-label`, and used `focus-within:ring-2` on the label to create a visible focus outline when the input is selected via keyboard.
